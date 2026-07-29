-- ============================================================
-- ADD COMMENT UPVOTES — run ONCE in the Supabase SQL Editor.
-- (Incremental update; run after add-comments.sql.)
--
-- Signed-in users can upvote a comment once; totals are public.
-- ============================================================

create table if not exists comment_votes (
  id         bigint generated always as identity primary key,
  comment_id bigint not null references comments(id) on delete cascade,
  voter_id   uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (comment_id, voter_id)
);

create index if not exists comment_votes_comment_idx on comment_votes (comment_id);

-- Public aggregate (owner view bypasses RLS deliberately: totals only,
-- never who upvoted)
create or replace view comment_vote_counts as
  select comment_id, count(*)::int as n
  from comment_votes
  group by comment_id;

alter table comment_votes enable row level security;

create policy "upvote comments" on comment_votes
  for insert to authenticated with check (voter_id = auth.uid());
create policy "read own comment votes" on comment_votes
  for select to authenticated using (voter_id = auth.uid());
create policy "remove own comment vote" on comment_votes
  for delete to authenticated using (voter_id = auth.uid());
