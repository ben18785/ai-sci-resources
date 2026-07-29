-- ============================================================
-- AI in Science — Learning Resource Voting App (with login)
-- Run this in Supabase: SQL Editor → New query → paste → Run
--
-- Identity model:
--   * Anyone can BROWSE without an account.
--   * Voting and suggesting require sign-in (GitHub / Google).
--   * On first sign-in the user saves an academic-background
--     profile (field + career stage) which travels with every
--     vote they cast.
-- ============================================================

-- 1. Profiles — one per signed-in user, holds academic background
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  field        text not null,                   -- e.g. 'Life sciences'
  stage        text not null,                   -- e.g. 'PhD / postgrad'
  created_at   timestamptz not null default now()
);

-- 2. Resources (seeded entries + user suggestions)
create table if not exists resources (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  url          text,
  description  text,
  rtype        text not null default 'other',   -- course | book | paper | tutorial | tool | video | community | other
  category     text,                            -- e.g. 'Machine learning', 'Applied statistics'
  disciplines  text[] not null default '{}',
  level        text not null default 'any',     -- beginner | intermediate | advanced | any
  suggested_by text,                            -- display name shown on the card
  suggester_id uuid references auth.users(id) on delete set null,
  approved     boolean not null default true,
  created_at   timestamptz not null default now()
);

-- 3. Votes — one per (resource, user), tagged with the voter's
--    background so rankings can be weighted.
create table if not exists votes (
  id          bigint generated always as identity primary key,
  resource_id uuid not null references resources(id) on delete cascade,
  voter_id    uuid not null references auth.users(id) on delete cascade,
  voter_field text not null,
  voter_stage text not null,
  created_at  timestamptz not null default now(),
  unique (resource_id, voter_id)
);

create index if not exists votes_resource_idx on votes (resource_id);

-- 4. Aggregated public view — exposes counts by background only,
--    never who voted for what. (Owner view: intentionally bypasses
--    the votes RLS so everyone can see aggregate counts.)
create or replace view vote_counts as
  select resource_id, voter_field, voter_stage, count(*)::int as n
  from votes
  group by resource_id, voter_field, voter_stage;

-- 5. Row-level security
alter table profiles  enable row level security;
alter table resources enable row level security;
alter table votes     enable row level security;

-- Profiles: each user manages only their own
create policy "read own profile"   on profiles for select using (auth.uid() = id);
create policy "create own profile" on profiles for insert with check (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);

-- Resources: anyone (even signed out) may read approved entries;
-- only signed-in users may suggest, and only as themselves
create policy "read approved resources" on resources
  for select using (approved = true);
create policy "suggest resources" on resources
  for insert to authenticated with check (suggester_id = auth.uid());

-- Votes: signed-in users may cast/remove their own votes and see
-- only their own raw votes (aggregates come from the view above)
create policy "cast own vote" on votes
  for insert to authenticated with check (voter_id = auth.uid());
create policy "read own votes" on votes
  for select to authenticated using (voter_id = auth.uid());
create policy "remove own vote" on votes
  for delete to authenticated using (voter_id = auth.uid());

-- NOTE: to moderate suggestions before they appear, run:
--   alter table resources alter column approved set default false;
-- then approve entries in Table Editor → resources (approved = true).
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
-- ============================================================
-- FEATURES BATCH — run ONCE in the Supabase SQL Editor.
-- Adds: Trending data, privacy-friendly usage stats, moderators.
-- ============================================================

-- 1. Trending: resource votes cast in the last 30 days
create or replace view vote_counts_30d as
  select resource_id, count(*)::int as n
  from votes
  where created_at > now() - interval '30 days'
  group by resource_id;

-- 2. Privacy-friendly usage stats.
--    Each visit logs a random visitor/session id and a country code —
--    no IP address, no personal data, nothing linkable to an account.
create table if not exists pageviews (
  id         bigint generated always as identity primary key,
  visitor_id uuid not null,
  session_id uuid not null,
  country    text,
  created_at timestamptz not null default now()
);

create index if not exists pageviews_created_idx on pageviews (created_at);

alter table pageviews enable row level security;

-- anyone may log a visit; nobody may read raw rows (aggregates only,
-- via the owner view below)
create policy "log pageviews" on pageviews
  for insert with check (true);

create or replace view site_stats as
  select
    (select count(distinct visitor_id) from pageviews)                                                    as people_all,
    (select count(distinct session_id) from pageviews)                                                    as sessions_all,
    (select count(distinct country)    from pageviews where country is not null)                          as countries_all,
    (select count(distinct visitor_id) from pageviews where created_at > now() - interval '30 days')      as people_30d,
    (select count(distinct session_id) from pageviews where created_at > now() - interval '30 days')      as sessions_30d,
    (select count(distinct country)    from pageviews where country is not null
                                                        and created_at > now() - interval '30 days')      as countries_30d;

-- 3. Moderators: admins can delete any comment or resource, and edit
--    any resource. Make yourself an admin by running (find your user id
--    in Authentication → Users, or in the profiles table):
--
--    insert into admins (user_id) values ('YOUR-USER-UUID-HERE');
--
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table admins enable row level security;

create policy "see own adminship" on admins
  for select to authenticated using (user_id = auth.uid());

create policy "admin delete any comment" on comments
  for delete to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

create policy "admin delete any resource" on resources
  for delete to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

create policy "admin update any resource" on resources
  for update to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));
-- ============================================================
-- VISITOR MAP — run ONCE in the Supabase SQL Editor.
-- Public per-country visitor totals for the world-map view.
-- (Aggregates only: a country code and counts — no personal data.)
-- ============================================================

create or replace view country_stats as
  select country,
         count(distinct visitor_id)::int as people,
         count(distinct session_id)::int as sessions
  from pageviews
  where country is not null
  group by country;
-- ============================================================
-- PROFILE V2 + CONSTELLATION — run ONCE in the Supabase SQL Editor.
-- Adds: multiple disciplines per user, separate AI/ML and
-- statistics experience levels, and richer vote tagging so
-- rankings can weight by similar experience.
-- ============================================================

-- 1. Profiles: multi-discipline + experience levels
alter table profiles add column if not exists fields text[] not null default '{}';
alter table profiles add column if not exists ai_level text;
alter table profiles add column if not exists stats_level text;

-- migrate existing single-field profiles
update profiles set fields = array[field]
  where (fields = '{}' or fields is null) and field is not null;

-- 2. Votes: snapshot the voter's full background
alter table votes add column if not exists voter_fields text[];
alter table votes add column if not exists voter_ai text;
alter table votes add column if not exists voter_stats text;

update votes set voter_fields = array[voter_field] where voter_fields is null;

-- 3. Rebuild the public aggregate view with the new columns
--    (drop + create because the column set changes)
drop view if exists vote_counts;
create view vote_counts as
  select resource_id, voter_fields, voter_stage, voter_ai, voter_stats,
         count(*)::int as n
  from votes
  group by resource_id, voter_fields, voter_stage, voter_ai, voter_stats;
-- ============================================================
-- PROGRAMMING LANGUAGES — run ONCE in the Supabase SQL Editor.
-- Adds: languages on profiles (asked at sign-up) and on
-- resources (tagged when suggesting), plus tags for the obvious
-- existing seed resources so the language filter has data.
-- ============================================================

alter table profiles  add column if not exists languages text[] not null default '{}';
alter table resources add column if not exists languages text[] not null default '{}';

-- Tag the clearly language-specific seed resources (matched by title;
-- only fills in entries not already tagged)
update resources set languages = array['Python'] where languages = '{}' and (
     title ilike 'Think Python%' or title ilike 'Machine Learning from Scratch%'
  or title ilike 'Crash Course on Python%' or title ilike 'Python for Data Science%'
  or title ilike 'Deep Neural Networks with PyTorch%' or title ilike 'Introduction to TensorFlow%'
  or title ilike 'CS50%' or title ilike '6.0001%'
  or title ilike 'Deep Learning Basics%' or title ilike 'UvA Deep Learning%'
  or title ilike 'Dive into Deep Learning%' or title ilike 'Deep Learning with Python%'
  or title ilike 'Practical Deep Learning for Coders%'
  or title ilike 'Supervised Machine Learning%' or title ilike 'Unsupervised Learning, Recommenders%'
  or title ilike 'Deep Learning Specialization%' or title ilike 'Symbolic Model Discovery%'
  or title ilike 'RAG Copilot%' or title ilike 'Mathematical Foundations of Machine Learning%'
  or title ilike 'Knowledge-Guided Machine Learning%' or title ilike 'Foundation Model for Science%'
  or title ilike 'Audio Signal Processing%'
);

update resources set languages = array['R'] where languages = '{}' and (
     title ilike 'Hands-On Programming with R%' or title ilike 'Hands-On Machine Learning with R%'
  or title ilike 'Data Analysis with R%' or title ilike 'Bayesian Statistics Specialization%'
  or title ilike 'A Student%s Guide to Bayesian%'
);

update resources set languages = array['R','Python'] where languages = '{}' and (
     title ilike 'Statistical Rethinking%' or title ilike 'U Toronto Map & Data Library%'
);

update resources set languages = array['R','Python','MATLAB'] where languages = '{}' and
     title ilike 'Bayesian Data Analysis%';
-- ============================================================
-- MY PATH — run ONCE in the Supabase SQL Editor.
-- Per-user "like to do" list, ordering, and done-ticks, powering
-- the Pathways and My path views. Private to each user.
-- ============================================================

create table if not exists my_path (
  user_id     uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references resources(id) on delete cascade,
  position    int  not null default 0,
  in_list     boolean not null default true,   -- shown in "My path" (starred)
  done        boolean not null default false,  -- ticked as completed
  created_at  timestamptz not null default now(),
  primary key (user_id, resource_id)
);

alter table my_path enable row level security;

create policy "own path only" on my_path
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- editable name for each user's personal path
alter table profiles add column if not exists path_name text;
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
-- ============================================================
-- PUBLIC PROFILES — run ONCE in the Supabase SQL Editor.
-- Optional, opt-in public profiles: name, institution, email,
-- blurb, photo, chosen field(s), and contribution stats.
-- Nothing is exposed for anyone who hasn't opted in.
-- ============================================================

-- 1. Profile columns (all default to private/empty)
alter table profiles add column if not exists public_profile boolean not null default false;
alter table profiles add column if not exists pub_name text;
alter table profiles add column if not exists institution text;
alter table profiles add column if not exists pub_email text;
alter table profiles add column if not exists blurb text;
alter table profiles add column if not exists show_fields boolean not null default false;
alter table profiles add column if not exists avatar_url text;

-- 2. Public view — ONLY opted-in rows, ONLY public fields.
--    (Background stays private; fields appear only if show_fields.)
create or replace view public_profiles as
  select id,
         coalesce(nullif(pub_name, ''), display_name) as name,
         institution, pub_email, blurb, avatar_url,
         case when show_fields then fields else '{}'::text[] end as fields,
         created_at
  from profiles
  where public_profile = true;

-- 3. Contribution stats for opted-in users
create or replace view public_profile_stats as
  select p.id,
         (select count(*) from resources r where r.suggester_id = p.id and r.approved)::int as resources_added,
         (select count(*) from votes v join resources r2 on r2.id = v.resource_id
            where r2.suggester_id = p.id)::int as votes_earned,
         (select count(*) from comments c where c.author_id = p.id)::int as comments_n,
         (select count(*) from request_replies rr
            where rr.author_id = p.id and rr.resource_id is not null)::int as answered_n
  from profiles p
  where p.public_profile = true;

-- 4. Avatar photo storage: a public bucket, each user writes only
--    to their own folder ("<their-user-id>/...")
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "avatar public read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatar upload own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- NOTE: if the storage policies above fail with "must be owner of
-- table objects", create them instead in the dashboard under
-- Storage → avatars → Policies, with the same definitions.
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
