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
