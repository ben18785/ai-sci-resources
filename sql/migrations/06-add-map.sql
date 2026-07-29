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
