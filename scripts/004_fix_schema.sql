-- Fix schema: Add missing columns and recreate policies
-- Run this in Supabase SQL Editor

-- First, drop the existing table if it exists (this will lose data if any)
-- If you want to preserve data, use ALTER TABLE ADD COLUMN instead
DROP TABLE IF EXISTS public.attempts CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create attempts table with all required columns
CREATE TABLE public.attempts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  question_mode text NOT NULL CHECK (question_mode IN ('demo', 'real')),
  selection_mode text NOT NULL CHECK (selection_mode IN ('all', 'random', 'tag')),
  selection_meta jsonb DEFAULT '{}'::jsonb,
  total_questions integer NOT NULL CHECK (total_questions > 0),
  correct_count integer NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  wrong_count integer NOT NULL DEFAULT 0 CHECK (wrong_count >= 0),
  blank_count integer NOT NULL DEFAULT 0 CHECK (blank_count >= 0),
  percentage numeric(5, 2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  duration_seconds integer NOT NULL CHECK (duration_seconds >= 0),
  answers jsonb DEFAULT '{}'::jsonb,
  grading jsonb DEFAULT '{}'::jsonb,
  snapshot_questions jsonb DEFAULT NULL
);

-- Create indexes for performance
CREATE INDEX idx_attempts_user_id ON public.attempts(user_id);
CREATE INDEX idx_attempts_created_at ON public.attempts(created_at DESC);
CREATE INDEX idx_attempts_question_mode ON public.attempts(question_mode);
CREATE INDEX idx_attempts_user_created ON public.attempts(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attempts table
CREATE POLICY "Users can view their own attempts"
  ON public.attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts"
  ON public.attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot update attempts"
  ON public.attempts FOR UPDATE
  USING (false);

CREATE POLICY "Users cannot delete attempts"
  ON public.attempts FOR DELETE
  USING (false);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a view for attempt statistics
CREATE OR REPLACE VIEW public.attempt_stats AS
SELECT
  user_id,
  question_mode,
  count(*) as total_attempts,
  avg(percentage) as avg_percentage,
  max(percentage) as best_percentage,
  sum(duration_seconds) as total_time_seconds
FROM public.attempts
GROUP BY user_id, question_mode;

-- Grant access
GRANT SELECT ON public.attempt_stats TO authenticated;

-- Comments
COMMENT ON TABLE public.attempts IS 'Stores completed test attempts for each user';
COMMENT ON COLUMN public.attempts.selection_meta IS 'JSON object with n (count) or tag (string) depending on selection_mode';
COMMENT ON COLUMN public.attempts.answers IS 'JSON object mapping question ID to array of selected option IDs';
COMMENT ON COLUMN public.attempts.grading IS 'JSON object mapping question ID to grading details (correct, chosen, status)';
