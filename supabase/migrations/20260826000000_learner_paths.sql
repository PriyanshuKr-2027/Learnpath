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
