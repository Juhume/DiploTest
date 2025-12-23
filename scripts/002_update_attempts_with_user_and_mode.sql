-- Drop existing table and recreate with user_id and question_mode columns
DROP TABLE IF EXISTS attempts;

-- Create attempts table with user authentication and mode support
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  question_mode TEXT NOT NULL CHECK (question_mode IN ('demo', 'real')),
  selection_mode TEXT NOT NULL CHECK (selection_mode IN ('all', 'random', 'tag')),
  selection_meta JSONB DEFAULT '{}',
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  wrong_count INTEGER NOT NULL,
  blank_count INTEGER NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  duration_seconds INTEGER NOT NULL,
  answers JSONB DEFAULT '{}',
  grading JSONB DEFAULT '{}'
);

-- Indexes for faster queries
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_created_at ON attempts(created_at DESC);
CREATE INDEX idx_attempts_question_mode ON attempts(question_mode);

-- Enable Row Level Security
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own attempts
CREATE POLICY "Users can view their own attempts" 
  ON attempts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts" 
  ON attempts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attempts" 
  ON attempts FOR DELETE 
  USING (auth.uid() = user_id);
