-- Complete schema for Oposicion Test App
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Attempts table (should already exist, but we ensure it has all fields)
create table if not exists public.attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  question_mode text not null check (question_mode in ('demo', 'real')),
  selection_mode text not null check (selection_mode in ('all', 'random', 'tag')),
  selection_meta jsonb default '{}'::jsonb,
  total_questions integer not null check (total_questions > 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  wrong_count integer not null default 0 check (wrong_count >= 0),
  blank_count integer not null default 0 check (blank_count >= 0),
  percentage numeric(5, 2) not null check (percentage >= 0 and percentage <= 100),
  duration_seconds integer not null check (duration_seconds >= 0),
  answers jsonb default '{}'::jsonb,
  grading jsonb default '{}'::jsonb,
  snapshot_questions jsonb default null -- Optional: frozen copy of questions
);

-- Create indexes for performance
create index if not exists idx_attempts_user_id on public.attempts(user_id);
create index if not exists idx_attempts_created_at on public.attempts(created_at desc);
create index if not exists idx_attempts_question_mode on public.attempts(question_mode);
create index if not exists idx_attempts_user_created on public.attempts(user_id, created_at desc);

-- Enable Row Level Security
alter table public.attempts enable row level security;

-- RLS Policies for attempts table
-- Users can only read their own attempts
drop policy if exists "Users can view their own attempts" on public.attempts;
create policy "Users can view their own attempts"
  on public.attempts for select
  using (auth.uid() = user_id);

-- Users can only insert their own attempts
drop policy if exists "Users can insert their own attempts" on public.attempts;
create policy "Users can insert their own attempts"
  on public.attempts for insert
  with check (auth.uid() = user_id);

-- Users cannot update or delete attempts (immutable record)
drop policy if exists "Users cannot update attempts" on public.attempts;
create policy "Users cannot update attempts"
  on public.attempts for update
  using (false);

drop policy if exists "Users cannot delete attempts" on public.attempts;
create policy "Users cannot delete attempts"
  on public.attempts for delete
  using (false);

-- Optional: Create a public.profiles table for additional user info
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- RLS Policies for profiles
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Function to handle new user creation (create profile automatically)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a view for attempt statistics (optional, for analytics)
create or replace view public.attempt_stats as
select
  user_id,
  question_mode,
  count(*) as total_attempts,
  avg(percentage) as avg_percentage,
  max(percentage) as best_percentage,
  sum(duration_seconds) as total_time_seconds
from public.attempts
group by user_id, question_mode;

-- Grant access to the view
grant select on public.attempt_stats to authenticated;

-- Comments for documentation
comment on table public.attempts is 'Stores completed test attempts for each user';
comment on column public.attempts.selection_meta is 'JSON object with n (count) or tag (string) depending on selection_mode';
comment on column public.attempts.answers is 'JSON object mapping question ID to array of selected option IDs';
comment on column public.attempts.grading is 'JSON object mapping question ID to grading details (correct, chosen, status)';
comment on column public.attempts.snapshot_questions is 'Optional frozen copy of questions at time of attempt';
