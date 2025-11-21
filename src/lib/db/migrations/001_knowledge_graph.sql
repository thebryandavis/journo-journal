-- Migration: Add Knowledge Graph Support
-- Created: 2025-01-20
-- Description: Adds tables for note relationships, similarity scores, and graph visualization

-- Note Relationships Table
CREATE TABLE IF NOT EXISTS note_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  target_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL DEFAULT 'similar',
  -- Types: 'similar', 'references', 'builds_on', 'contradicts', 'manual'
  strength FLOAT NOT NULL DEFAULT 0.5,
  -- Similarity score 0.0 to 1.0
  auto_generated BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  -- Store additional context about the relationship
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Prevent duplicate relationships
  CONSTRAINT unique_relationship UNIQUE (source_note_id, target_note_id),
  -- Ensure strength is between 0 and 1
  CONSTRAINT valid_strength CHECK (strength >= 0 AND strength <= 1)
);

-- Note Embeddings Table (for semantic similarity)
CREATE TABLE IF NOT EXISTS note_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL UNIQUE REFERENCES notes(id) ON DELETE CASCADE,
  embedding JSONB,
  -- Store as JSON array of 1536 floats (pgvector extension not required)
  -- OpenAI text-embedding-3-small dimension
  model VARCHAR(100) DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Graph Metadata (for caching graph computations)
CREATE TABLE IF NOT EXISTS graph_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_nodes INTEGER DEFAULT 0,
  total_edges INTEGER DEFAULT 0,
  avg_connections_per_note FLOAT DEFAULT 0,
  last_computed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  computation_time_ms INTEGER,
  CONSTRAINT unique_user_graph UNIQUE (user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_relationships_source ON note_relationships(source_note_id);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON note_relationships(target_note_id);
CREATE INDEX IF NOT EXISTS idx_relationships_strength ON note_relationships(strength DESC);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON note_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_embeddings_note ON note_embeddings(note_id);

-- Function to automatically update note relationships when embeddings change
CREATE OR REPLACE FUNCTION update_note_relationships()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete old auto-generated relationships for this note
  DELETE FROM note_relationships
  WHERE (source_note_id = NEW.note_id OR target_note_id = NEW.note_id)
  AND auto_generated = true;

  -- Trigger will be followed by backend process to compute new relationships
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_relationships
AFTER INSERT OR UPDATE ON note_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_note_relationships();

-- Function to get related notes for a given note
CREATE OR REPLACE FUNCTION get_related_notes(
  p_note_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_min_strength FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  note_id UUID,
  title VARCHAR,
  relationship_type VARCHAR,
  strength FLOAT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN r.source_note_id = p_note_id THEN r.target_note_id
      ELSE r.source_note_id
    END as note_id,
    n.title,
    r.relationship_type,
    r.strength,
    n.created_at
  FROM note_relationships r
  INNER JOIN notes n ON (
    CASE
      WHEN r.source_note_id = p_note_id THEN r.target_note_id
      ELSE r.source_note_id
    END = n.id
  )
  WHERE (r.source_note_id = p_note_id OR r.target_note_id = p_note_id)
  AND r.strength >= p_min_strength
  ORDER BY r.strength DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate graph statistics
CREATE OR REPLACE FUNCTION calculate_graph_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_nodes INTEGER;
  v_total_edges INTEGER;
  v_avg_connections FLOAT;
  v_start_time TIMESTAMP;
  v_computation_time INTEGER;
BEGIN
  v_start_time := clock_timestamp();

  -- Count nodes (notes belonging to user)
  SELECT COUNT(*) INTO v_total_nodes
  FROM notes
  WHERE user_id = p_user_id;

  -- Count edges (relationships between user's notes)
  SELECT COUNT(*) INTO v_total_edges
  FROM note_relationships r
  INNER JOIN notes n1 ON r.source_note_id = n1.id
  WHERE n1.user_id = p_user_id;

  -- Calculate average connections
  IF v_total_nodes > 0 THEN
    v_avg_connections := v_total_edges::FLOAT / v_total_nodes::FLOAT;
  ELSE
    v_avg_connections := 0;
  END IF;

  v_computation_time := EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start_time));

  -- Insert or update graph metadata
  INSERT INTO graph_metadata (
    user_id,
    total_nodes,
    total_edges,
    avg_connections_per_note,
    last_computed,
    computation_time_ms
  )
  VALUES (
    p_user_id,
    v_total_nodes,
    v_total_edges,
    v_avg_connections,
    clock_timestamp(),
    v_computation_time
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_nodes = v_total_nodes,
    total_edges = v_total_edges,
    avg_connections_per_note = v_avg_connections,
    last_computed = clock_timestamp(),
    computation_time_ms = v_computation_time;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update graph stats when relationships change
CREATE OR REPLACE FUNCTION trigger_graph_stats_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the user_id from the note
  PERFORM calculate_graph_stats(
    (SELECT user_id FROM notes WHERE id = NEW.source_note_id LIMIT 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_graph_stats
AFTER INSERT OR DELETE ON note_relationships
FOR EACH ROW
EXECUTE FUNCTION trigger_graph_stats_update();

COMMENT ON TABLE note_relationships IS 'Stores connections between notes for knowledge graph visualization';
COMMENT ON TABLE note_embeddings IS 'Stores vector embeddings for semantic similarity search';
COMMENT ON TABLE graph_metadata IS 'Cached statistics about user knowledge graphs';
