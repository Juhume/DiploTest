-- Create attempts table for storing test results
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  wrong_count INTEGER NOT NULL,
  blank_count INTEGER NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  duration_seconds INTEGER NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('all', 'random', 'tag')),
  selection_meta JSONB DEFAULT '{}',
  answers JSONB DEFAULT '{}'
);

-- Create index for faster queries ordered by date
CREATE INDEX IF NOT EXISTS idx_attempts_created_at ON attempts(created_at DESC);

-- Enable RLS but allow anonymous access (no auth required per spec)
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read attempts (anonymous access)
CREATE POLICY "Allow anonymous read" ON attempts FOR SELECT USING (true);

-- Allow anyone to insert attempts (anonymous access)
CREATE POLICY "Allow anonymous insert" ON attempts FOR INSERT WITH CHECK (true);
