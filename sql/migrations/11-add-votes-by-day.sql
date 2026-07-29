-- ============================================================
-- VOTES BY DAY — run ONCE in the Supabase SQL Editor.
-- Public daily vote counts (totals only), powering the
-- cumulative votes-over-time chart in the hero.
-- ============================================================

create or replace view votes_by_day as
  select created_at::date as day, count(*)::int as n
  from votes
  group by 1
  order by 1;
