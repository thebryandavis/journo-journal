-- Migration: Add Spaced Repetition and Active Recall System
-- Created: 2025-01-20
-- Description: Tables for quiz generation, review scheduling, and learning analytics

-- Review Items Table (quiz questions generated from notes)
CREATE TABLE IF NOT EXISTS review_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'short_answer',
  -- Types: 'short_answer', 'multiple_choice', 'true_false', 'fill_blank'
  difficulty VARCHAR(20) DEFAULT 'medium',
  -- Difficulty: 'easy', 'medium', 'hard'

  -- SM-2 Algorithm Fields
  next_review TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 day'),
  interval_days FLOAT NOT NULL DEFAULT 1.0,
  ease_factor FLOAT NOT NULL DEFAULT 2.5,
  -- Range: 1.3 to 2.5+
  repetitions INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'active',
  -- Status: 'active', 'suspended', 'archived'

  -- Metadata
  auto_generated BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Review Sessions Table (tracks each review attempt)
CREATE TABLE IF NOT EXISTS review_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_item_id UUID NOT NULL REFERENCES review_items(id) ON DELETE CASCADE,
  reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- SM-2 Quality Rating (0-5)
  quality INTEGER NOT NULL CHECK (quality >= 0 AND quality <= 5),
  -- 0: Complete blackout
  -- 1: Incorrect, but familiar
  -- 2: Incorrect, but remembered with effort
  -- 3: Correct with serious difficulty
  -- 4: Correct with hesitation
  -- 5: Perfect recall

  -- Session Details
  time_spent_seconds INTEGER,
  user_answer TEXT,
  was_correct BOOLEAN,

  -- Updated Scheduling
  new_interval_days FLOAT,
  new_ease_factor FLOAT,
  new_next_review TIMESTAMP,

  metadata JSONB DEFAULT '{}'
);

-- Learning Statistics Table (aggregated stats per user)
CREATE TABLE IF NOT EXISTS learning_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Overall Stats
  total_items INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,

  -- Performance
  average_quality FLOAT DEFAULT 0,
  retention_rate FLOAT DEFAULT 0,
  -- Percentage of items recalled correctly
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,

  -- Due Items
  items_due_today INTEGER DEFAULT 0,
  items_due_this_week INTEGER DEFAULT 0,

  -- Progress
  items_mastered INTEGER DEFAULT 0,
  -- Items with interval > 30 days

  last_review_date TIMESTAMP,
  last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  metadata JSONB DEFAULT '{}'
);

-- Review Queue View (items due for review)
CREATE OR REPLACE VIEW review_queue AS
SELECT
  ri.*,
  n.title as note_title,
  n.type as note_type,
  COUNT(rs.id) as review_count,
  AVG(rs.quality) as avg_quality
FROM review_items ri
INNER JOIN notes n ON ri.note_id = n.id
LEFT JOIN review_sessions rs ON ri.id = rs.review_item_id
WHERE ri.status = 'active'
AND ri.next_review <= CURRENT_TIMESTAMP
GROUP BY ri.id, n.title, n.type
ORDER BY ri.next_review ASC;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_items_user ON review_items(user_id);
CREATE INDEX IF NOT EXISTS idx_review_items_note ON review_items(note_id);
CREATE INDEX IF NOT EXISTS idx_review_items_next_review ON review_items(next_review);
CREATE INDEX IF NOT EXISTS idx_review_items_status ON review_items(status);
CREATE INDEX IF NOT EXISTS idx_review_sessions_user ON review_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_review_sessions_item ON review_sessions(review_item_id);
CREATE INDEX IF NOT EXISTS idx_review_sessions_reviewed_at ON review_sessions(reviewed_at);

-- Function to calculate next review using SM-2 algorithm
CREATE OR REPLACE FUNCTION calculate_next_review(
  p_quality INTEGER,
  p_ease_factor FLOAT,
  p_interval_days FLOAT,
  p_repetitions INTEGER
)
RETURNS TABLE (
  new_ease_factor FLOAT,
  new_interval_days FLOAT,
  new_repetitions INTEGER
) AS $$
DECLARE
  v_ease_factor FLOAT;
  v_interval FLOAT;
  v_repetitions INTEGER;
BEGIN
  -- Update ease factor based on quality
  v_ease_factor := p_ease_factor + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02));

  -- Ensure ease factor stays within valid range
  IF v_ease_factor < 1.3 THEN
    v_ease_factor := 1.3;
  END IF;

  -- Calculate new interval based on quality
  IF p_quality < 3 THEN
    -- Failed recall - reset to 1 day
    v_interval := 1.0;
    v_repetitions := 0;
  ELSE
    -- Successful recall - increase interval
    v_repetitions := p_repetitions + 1;

    IF v_repetitions = 1 THEN
      v_interval := 1.0;
    ELSIF v_repetitions = 2 THEN
      v_interval := 6.0;
    ELSE
      v_interval := p_interval_days * v_ease_factor;
    END IF;
  END IF;

  RETURN QUERY SELECT v_ease_factor, v_interval, v_repetitions;
END;
$$ LANGUAGE plpgsql;

-- Function to record a review and update scheduling
CREATE OR REPLACE FUNCTION record_review_session(
  p_user_id UUID,
  p_review_item_id UUID,
  p_quality INTEGER,
  p_time_spent_seconds INTEGER DEFAULT NULL,
  p_user_answer TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_current_item RECORD;
  v_next_review_calc RECORD;
  v_next_review_timestamp TIMESTAMP;
BEGIN
  -- Get current review item
  SELECT * INTO v_current_item
  FROM review_items
  WHERE id = p_review_item_id AND user_id = p_user_id;

  IF v_current_item IS NULL THEN
    RAISE EXCEPTION 'Review item not found';
  END IF;

  -- Calculate next review schedule
  SELECT * INTO v_next_review_calc
  FROM calculate_next_review(
    p_quality,
    v_current_item.ease_factor,
    v_current_item.interval_days,
    v_current_item.repetitions
  );

  -- Calculate next review timestamp
  v_next_review_timestamp := CURRENT_TIMESTAMP + (v_next_review_calc.new_interval_days || ' days')::INTERVAL;

  -- Insert review session record
  INSERT INTO review_sessions (
    user_id,
    review_item_id,
    quality,
    time_spent_seconds,
    user_answer,
    was_correct,
    new_interval_days,
    new_ease_factor,
    new_next_review
  )
  VALUES (
    p_user_id,
    p_review_item_id,
    p_quality,
    p_time_spent_seconds,
    p_user_answer,
    p_quality >= 3,
    v_next_review_calc.new_interval_days,
    v_next_review_calc.new_ease_factor,
    v_next_review_timestamp
  )
  RETURNING id INTO v_session_id;

  -- Update review item
  UPDATE review_items
  SET
    next_review = v_next_review_timestamp,
    interval_days = v_next_review_calc.new_interval_days,
    ease_factor = v_next_review_calc.new_ease_factor,
    repetitions = v_next_review_calc.new_repetitions,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_review_item_id;

  -- Update learning stats
  PERFORM update_learning_stats(p_user_id);

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update learning statistics
CREATE OR REPLACE FUNCTION update_learning_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_stats RECORD;
BEGIN
  -- Calculate stats
  SELECT
    COUNT(DISTINCT ri.id) as total_items,
    COUNT(rs.id) as total_reviews,
    COALESCE(SUM(rs.time_spent_seconds) / 60, 0) as total_time_minutes,
    COALESCE(AVG(rs.quality), 0) as average_quality,
    COALESCE(
      COUNT(CASE WHEN rs.was_correct THEN 1 END)::FLOAT /
      NULLIF(COUNT(rs.id), 0),
      0
    ) as retention_rate,
    COUNT(CASE WHEN ri.next_review <= CURRENT_TIMESTAMP THEN 1 END) as items_due_today,
    COUNT(CASE WHEN ri.next_review <= CURRENT_TIMESTAMP + INTERVAL '7 days' THEN 1 END) as items_due_this_week,
    COUNT(CASE WHEN ri.interval_days > 30 THEN 1 END) as items_mastered
  INTO v_stats
  FROM review_items ri
  LEFT JOIN review_sessions rs ON ri.id = rs.review_item_id
  WHERE ri.user_id = p_user_id
  AND ri.status = 'active';

  -- Insert or update stats
  INSERT INTO learning_stats (
    user_id,
    total_items,
    total_reviews,
    total_time_minutes,
    average_quality,
    retention_rate,
    items_due_today,
    items_due_this_week,
    items_mastered,
    last_calculated
  )
  VALUES (
    p_user_id,
    v_stats.total_items,
    v_stats.total_reviews,
    v_stats.total_time_minutes,
    v_stats.average_quality,
    v_stats.retention_rate,
    v_stats.items_due_today,
    v_stats.items_due_this_week,
    v_stats.items_mastered,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_items = v_stats.total_items,
    total_reviews = v_stats.total_reviews,
    total_time_minutes = v_stats.total_time_minutes,
    average_quality = v_stats.average_quality,
    retention_rate = v_stats.retention_rate,
    items_due_today = v_stats.items_due_today,
    items_due_this_week = v_stats.items_due_this_week,
    items_mastered = v_stats.items_mastered,
    last_calculated = CURRENT_TIMESTAMP,
    last_review_date = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE review_items IS 'Quiz questions generated from notes for spaced repetition';
COMMENT ON TABLE review_sessions IS 'Individual review attempts with SM-2 algorithm tracking';
COMMENT ON TABLE learning_stats IS 'Aggregated learning statistics per user';
