-- ============================================================
-- QUALITY BATCH — run ONCE in the Supabase SQL Editor.
-- Adds: difficulty micro-feedback on completed resources, and
-- a report/flag system feeding the moderators.
-- ============================================================

-- 1. Difficulty feedback lives on the my_path row (one per user+resource)
alter table my_path add column if not exists difficulty text;  -- 'too easy' | 'right level' | 'too hard'

-- public aggregate (counts only, never who)
create or replace view resource_difficulty as
  select resource_id, difficulty, count(*)::int as n
  from my_path
  where difficulty is not null
  group by resource_id, difficulty;

-- 2. Reports: anyone signed-in can flag content; only moderators see flags
create table if not exists flags (
  id          bigint generated always as identity primary key,
  target_type text not null,          -- 'resource' | 'comment' | 'request' | 'reply'
  target_id   text not null,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason      text,
  created_at  timestamptz not null default now(),
  unique (target_type, target_id, reporter_id)
);

alter table flags enable row level security;

create policy "report content" on flags
  for insert to authenticated with check (reporter_id = auth.uid());
create policy "admins read flags" on flags
  for select to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));
create policy "admins clear flags" on flags
  for delete to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));
