-- Migration: Add Fact-Checking Support
-- Created: 2026-02-07
-- Description: Tables for storing fact-check runs and individual claim verifications

-- Fact Check Runs (one per note check)
CREATE TABLE IF NOT EXISTS fact_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- Status: 'pending', 'processing', 'completed', 'failed'
  summary TEXT,
  total_claims INTEGER DEFAULT 0,
  verified_count INTEGER DEFAULT 0,
  false_count INTEGER DEFAULT 0,
  unverified_count INTEGER DEFAULT 0,
  mixed_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Individual Claims within a Fact Check
CREATE TABLE IF NOT EXISTS fact_check_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fact_check_id UUID NOT NULL REFERENCES fact_checks(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  claim_context TEXT,
  verdict VARCHAR(30) NOT NULL DEFAULT 'unverified',
  -- Verdict: 'verified', 'false', 'unverified', 'mixed', 'partially_verified'
  confidence FLOAT DEFAULT 0,
  explanation TEXT,
  sources JSONB DEFAULT '[]',
  search_queries JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fact_checks_note_id ON fact_checks(note_id);
CREATE INDEX IF NOT EXISTS idx_fact_checks_user_id ON fact_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_fact_checks_status ON fact_checks(status);
CREATE INDEX IF NOT EXISTS idx_fact_checks_created_at ON fact_checks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claims_fact_check_id ON fact_check_claims(fact_check_id);
CREATE INDEX IF NOT EXISTS idx_claims_verdict ON fact_check_claims(verdict);

COMMENT ON TABLE fact_checks IS 'Stores fact-check runs for notes';
COMMENT ON TABLE fact_check_claims IS 'Individual claims extracted and verified during fact-checking';
