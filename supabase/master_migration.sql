-- ====================================================
-- SUPABASE MASTER MIGRATION FOR LEARNPATH AI / DSA DASHBOARD
-- Project: arptctnhudfdgarilydf
-- ====================================================

-- >>> Migration: 20260705111944_init_schema.sql >>>
-- 1. Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text not null,
  role text not null default 'learner' check (role in ('learner', 'admin')),
  dark_mode boolean not null default false,
  reminders boolean not null default true,
  current_streak integer not null default 0,
  last_active_date text,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profile policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- Trigger to automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case
      when new.email = 'princekumot1307@gmail.com' then 'admin'
      when new.email ilike '%admin%' then 'admin'
      else 'learner'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create days table
create table public.days (
  id bigint primary key,
  day_number integer not null unique,
  date_label text not null,
  pattern text not null,
  topic text not null,
  youtube_id text,
  notes_default text,
  created_at timestamp with time zone not null default now()
);

alter table public.days enable row level security;

create policy "Anyone can view days" on public.days
  for select using (true);

create policy "Only admins can modify days" on public.days
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- 3. Create problems table
create table public.problems (
  id uuid primary key default gen_random_uuid(),
  day_id bigint references public.days(id) on delete cascade not null,
  name text not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  leetcode_url text,
  gfg_url text,
  youtube_url text,
  is_missing_video boolean not null default false,
  order_index integer not null,
  created_at timestamp with time zone not null default now()
);

alter table public.problems enable row level security;

create policy "Anyone can view problems" on public.problems
  for select using (true);

create policy "Only admins can modify problems" on public.problems
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- 4. Create progress table (solved problems)
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  problem_id uuid references public.problems(id) on delete cascade not null,
  solved_at timestamp with time zone not null default now(),
  unique(user_id, problem_id)
);

alter table public.progress enable row level security;

create policy "Users can view their own progress" on public.progress
  for select using (auth.uid() = user_id);

create policy "Users can insert their own progress" on public.progress
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own progress" on public.progress
  for delete using (auth.uid() = user_id);

-- 5. Create progress_days table (manual day completion for 0-problem days)
create table public.progress_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  day_id bigint references public.days(id) on delete cascade not null,
  completed_at timestamp with time zone not null default now(),
  unique(user_id, day_id)
);

alter table public.progress_days enable row level security;

create policy "Users can view their own day progress" on public.progress_days
  for select using (auth.uid() = user_id);

create policy "Users can insert their own day progress" on public.progress_days
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own day progress" on public.progress_days
  for delete using (auth.uid() = user_id);

-- 6. Create user_notes table
create table public.user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  day_id bigint references public.days(id) on delete cascade not null,
  notes_text text not null,
  updated_at timestamp with time zone not null default now(),
  unique(user_id, day_id)
);

alter table public.user_notes enable row level security;

create policy "Users can view their own notes" on public.user_notes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notes" on public.user_notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own notes" on public.user_notes
  for update using (auth.uid() = user_id);

create policy "Users can delete their own notes" on public.user_notes
  for delete using (auth.uid() = user_id);

-- <<< End of 20260705111944_init_schema.sql <<<

-- >>> Migration: 20260705113324_add_setup_columns.sql >>>
-- Add setup/onboarding columns to profiles table
alter table public.profiles add column has_completed_setup boolean not null default false;
alter table public.profiles add column dob date;
alter table public.profiles add column mobile_no text;
alter table public.profiles add column groq_api_key text;

-- <<< End of 20260705113324_add_setup_columns.sql <<<

-- >>> Migration: 20260705171000_create_chat_history.sql >>>
-- Create chat_messages table to store persistent AI agent chat history
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  day_id bigint references public.days(id) on delete cascade,
  problem_id text,
  role text not null check (role in ('user', 'assistant')),
  message_text text not null,
  created_at timestamp with time zone not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.chat_messages enable row level security;

-- Policies for chat_messages
create policy "Users can view their own chat messages" on public.chat_messages
  for select using (auth.uid() = user_id);

create policy "Users can insert their own chat messages" on public.chat_messages
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own chat messages" on public.chat_messages
  for delete using (auth.uid() = user_id);

create policy "Admins can view all chat messages" on public.chat_messages
  for select using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- <<< End of 20260705171000_create_chat_history.sql <<<

-- >>> Migration: 20260705174000_create_sheet_progress.sql >>>
-- Create sheet_progress table to track pattern-wise sheet problem completions
create table public.sheet_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  problem_id text not null, -- problem id from risingbrain_data.json, e.g. "problem_0004"
  completed_at timestamp with time zone not null default now(),
  unique(user_id, problem_id)
);

-- Enable Row Level Security (RLS)
alter table public.sheet_progress enable row level security;

-- Policies for sheet_progress
create policy "Users can view their own sheet progress" on public.sheet_progress
  for select using (auth.uid() = user_id);

create policy "Users can insert their own sheet progress" on public.sheet_progress
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own sheet progress" on public.sheet_progress
  for delete using (auth.uid() = user_id);

-- <<< End of 20260705174000_create_sheet_progress.sql <<<

-- >>> Migration: 20260705180500_create_social_tables.sql >>>
-- Migration to enable social features (Friendships & Group Chats)

-- 1. Enable reading profiles of other users for authenticated users (required for search and listing friends)
create policy "Allow authenticated users to view profiles" on public.profiles
  for select using (auth.role() = 'authenticated');

-- 2. Create friendships table
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status text not null check (status in ('pending', 'accepted')),
  created_at timestamp with time zone not null default now(),
  unique(sender_id, receiver_id)
);

-- Enable Row Level Security (RLS)
alter table public.friendships enable row level security;

-- Policies for friendships
create policy "Users can view their own friendships" on public.friendships
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can insert friendships they send" on public.friendships
  for insert with check (auth.uid() = sender_id);

create policy "Users can update friendships they are part of" on public.friendships
  for update using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can delete friendships they are part of" on public.friendships
  for delete using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- 3. Create group_chats table
create table public.group_chats (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS on group_chats
alter table public.group_chats enable row level security;

-- 4. Create group_members table
create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.group_chats(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamp with time zone not null default now(),
  unique(group_id, user_id)
);

-- Enable RLS on group_members
alter table public.group_members enable row level security;

-- Policies for group_chats (depends on group_members)
create policy "Members can view their group chats" on public.group_chats
  for select using (
    exists (
      select 1 from public.group_members
      where public.group_members.group_id = id and public.group_members.user_id = auth.uid()
    )
  );

create policy "Users can insert group chats" on public.group_chats
  for insert with check (auth.uid() = created_by);

-- Policies for group_members
create policy "Users can view members of groups they belong to" on public.group_members
  for select using (
    exists (
      select 1 from public.group_members as m
      where m.group_id = group_id and m.user_id = auth.uid()
    )
  );

create policy "Users can add members" on public.group_members
  for insert with check (
    exists (
      select 1 from public.group_chats as c
      where c.id = group_id and c.created_by = auth.uid()
    ) or auth.uid() = user_id
  );

create policy "Users can leave groups" on public.group_members
  for delete using (auth.uid() = user_id);

-- <<< End of 20260705180500_create_social_tables.sql <<<

-- >>> Migration: 20260705191500_add_session_id_to_chat_messages.sql >>>
-- Alter chat_messages to support chat sessions
alter table public.chat_messages add column session_id uuid not null default gen_random_uuid();

-- <<< End of 20260705191500_add_session_id_to_chat_messages.sql <<<

-- >>> Migration: 20260705201500_fix_social_policies.sql >>>
-- Drop the recursive policies
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON public.group_members;
DROP POLICY IF EXISTS "Members can view their group chats" ON public.group_chats;

-- Create the new non-recursive policies
CREATE POLICY "Users can view members of groups they belong to" ON public.group_members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Members can view their group chats" ON public.group_chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE public.group_members.group_id = id AND public.group_members.user_id = auth.uid()
    )
  );

-- <<< End of 20260705201500_fix_social_policies.sql <<<

-- >>> Migration: 20260707104500_admin_policies.sql >>>
-- Enable select access for administrators on progress, progress_days, user_notes, and sheet_progress tables

-- 1. Policies for progress
CREATE POLICY "Admins can view all progress" ON public.progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
  );

-- 2. Policies for progress_days
CREATE POLICY "Admins can view all progress_days" ON public.progress_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
  );

-- 3. Policies for user_notes
CREATE POLICY "Admins can view all user_notes" ON public.user_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
  );

-- 4. Policies for sheet_progress
CREATE POLICY "Admins can view all sheet_progress" ON public.sheet_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
    )
  );

-- <<< End of 20260707104500_admin_policies.sql <<<

-- >>> Migration: 20260707110000_leaderboard_policies.sql >>>
-- Migration to enable users to view their friends' progress for the leaderboard
-- Dropping existing select policies
DROP POLICY IF EXISTS "Users can view their own progress" ON public.progress;
DROP POLICY IF EXISTS "Users can view their own day progress" ON public.progress_days;

-- Creating new select policies that include friends
CREATE POLICY "Users can view their own and friends' progress" ON public.progress
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
      AND (
        (sender_id = auth.uid() AND receiver_id = user_id)
        OR (receiver_id = auth.uid() AND sender_id = user_id)
      )
    )
  );

CREATE POLICY "Users can view their own and friends' day progress" ON public.progress_days
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
      AND (
        (sender_id = auth.uid() AND receiver_id = user_id)
        OR (receiver_id = auth.uid() AND sender_id = user_id)
      )
    )
  );

-- <<< End of 20260707110000_leaderboard_policies.sql <<<

-- >>> Migration: 20260826000000_learner_paths.sql >>>
-- Migration: learner paths, notes, and roadmap diff tables
-- These power the adaptive roadmap, level notes, and recalibration audit trail.

-- 1. Learner AI profiles (goal, role, skills JSON)
create table if not exists public.learner_profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade not null unique,
  profile_data jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.learner_profiles enable row level security;

create policy "Users can read own learner_profile" on public.learner_profiles
  for select using (auth.uid() = user_id);

create policy "Users can upsert own learner_profile" on public.learner_profiles
  for all using (auth.uid() = user_id);

create policy "Admins can read all learner_profiles" on public.learner_profiles
  for select using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- 2. Active learning paths (versioned DAG)
create table if not exists public.learning_paths (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null unique,
  path_data   jsonb not null default '{}',
  version     integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.learning_paths enable row level security;

create policy "Users can read own path" on public.learning_paths
  for select using (auth.uid() = user_id);

create policy "Users can upsert own path" on public.learning_paths
  for all using (auth.uid() = user_id);

create policy "Admins can read all paths" on public.learning_paths
  for select using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- 3. Level notes (markdown, per level per user)
create table if not exists public.level_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade not null,
  level_id   text not null,
  content    text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, level_id)
);

alter table public.level_notes enable row level security;

create policy "Users can read own notes" on public.level_notes
  for select using (auth.uid() = user_id);

create policy "Users can upsert own notes" on public.level_notes
  for all using (auth.uid() = user_id);

-- 4. Roadmap diffs (audit trail of adaptive recalibrations)
create table if not exists public.roadmap_diffs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade not null,
  diff_data  jsonb not null default '{}',
  version    integer not null,
  created_at timestamptz not null default now()
);

alter table public.roadmap_diffs enable row level security;

create policy "Users can read own diffs" on public.roadmap_diffs
  for select using (auth.uid() = user_id);

create policy "Users can insert own diffs" on public.roadmap_diffs
  for insert with check (auth.uid() = user_id);

-- Updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger learner_profiles_updated_at
  before update on public.learner_profiles
  for each row execute procedure public.set_updated_at();

create trigger learning_paths_updated_at
  before update on public.learning_paths
  for each row execute procedure public.set_updated_at();

create trigger level_notes_updated_at
  before update on public.level_notes
  for each row execute procedure public.set_updated_at();

-- <<< End of 20260826000000_learner_paths.sql <<<
