-- ============================================================
-- ADD COMMENTS — run ONCE in the Supabase SQL Editor.
-- (Incremental update for an existing project; new installs get
-- this automatically from supabase-setup.sql.)
--
-- Anyone can read comments; only signed-in users can post, and
-- each user can delete their own.
-- ============================================================

create table if not exists comments (
  id          bigint generated always as identity primary key,
  resource_id uuid not null references resources(id) on delete cascade,
  author_id   uuid not null references auth.users(id) on delete cascade,
  author_name text,
  body        text not null check (char_length(body) between 1 and 2000),
  created_at  timestamptz not null default now()
);

create index if not exists comments_resource_idx on comments (resource_id);

alter table comments enable row level security;

create policy "read comments" on comments
  for select using (true);
create policy "post own comments" on comments
  for insert to authenticated with check (author_id = auth.uid());
create policy "delete own comments" on comments
  for delete to authenticated using (author_id = auth.uid());
