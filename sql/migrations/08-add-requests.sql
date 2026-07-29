-- ============================================================
-- REQUESTS — run ONCE in the Supabase SQL Editor.
-- A mini-forum: people ask for learning materials, others
-- upvote requests they share and reply with advice or an
-- attached resource (existing or newly contributed).
-- ============================================================

create table if not exists requests (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references auth.users(id) on delete cascade,
  author_name text,
  title       text not null check (char_length(title) between 3 and 120),
  body        text check (body is null or char_length(body) <= 600),
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists request_votes (
  id         bigint generated always as identity primary key,
  request_id uuid not null references requests(id) on delete cascade,
  voter_id   uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (request_id, voter_id)
);

-- public aggregate (owner view: totals only, never who)
create or replace view request_vote_counts as
  select request_id, count(*)::int as n
  from request_votes
  group by request_id;

create table if not exists request_replies (
  id          bigint generated always as identity primary key,
  request_id  uuid not null references requests(id) on delete cascade,
  author_id   uuid not null references auth.users(id) on delete cascade,
  author_name text,
  body        text check (body is null or char_length(body) <= 1500),
  resource_id uuid references resources(id) on delete set null,
  created_at  timestamptz not null default now(),
  check (body is not null or resource_id is not null)
);

create index if not exists request_replies_req_idx on request_replies (request_id);

alter table requests        enable row level security;
alter table request_votes   enable row level security;
alter table request_replies enable row level security;

-- Requests: everyone reads; signed-in users post as themselves;
-- the author (or a moderator) can update (e.g. mark resolved) or delete
create policy "read requests" on requests
  for select using (true);
create policy "post requests" on requests
  for insert to authenticated with check (author_id = auth.uid());
create policy "manage own or admin requests" on requests
  for update to authenticated
  using (author_id = auth.uid() or exists (select 1 from admins a where a.user_id = auth.uid()));
create policy "delete own or admin requests" on requests
  for delete to authenticated
  using (author_id = auth.uid() or exists (select 1 from admins a where a.user_id = auth.uid()));

-- Want-votes: one per person, own rows only (totals via the view)
create policy "want requests" on request_votes
  for insert to authenticated with check (voter_id = auth.uid());
create policy "read own request votes" on request_votes
  for select to authenticated using (voter_id = auth.uid());
create policy "unwant requests" on request_votes
  for delete to authenticated using (voter_id = auth.uid());

-- Replies: everyone reads; signed-in users post as themselves;
-- author or moderator deletes
create policy "read replies" on request_replies
  for select using (true);
create policy "post replies" on request_replies
  for insert to authenticated with check (author_id = auth.uid());
create policy "delete own or admin replies" on request_replies
  for delete to authenticated
  using (author_id = auth.uid() or exists (select 1 from admins a where a.user_id = auth.uid()));
