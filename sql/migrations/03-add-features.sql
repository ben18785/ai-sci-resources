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
