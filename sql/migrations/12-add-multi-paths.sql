-- ============================================================
-- MULTIPLE LEARNING PATHS — run ONCE in the Supabase SQL Editor.
-- Lets each user create several named paths (e.g. "Bayesian
-- inference", "Generative AI"). Done-ticks and difficulty
-- feedback stay on my_path (per user + resource, shared across
-- paths). Existing starred resources are moved into a default
-- path so nobody loses anything. Safe to re-run.
-- ============================================================

-- 1. Named paths, one row per path per user
create table if not exists paths (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default 'My learning path',
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

alter table paths enable row level security;

drop policy if exists "own paths only" on paths;
create policy "own paths only" on paths
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 2. Which resources are in which path, and in what order
create table if not exists path_items (
  path_id     uuid not null references paths(id) on delete cascade,
  resource_id uuid not null references resources(id) on delete cascade,
  position    int  not null default 0,
  created_at  timestamptz not null default now(),
  primary key (path_id, resource_id)
);

alter table path_items enable row level security;

drop policy if exists "own path items only" on path_items;
create policy "own path items only" on path_items
  for all to authenticated
  using (exists (select 1 from paths p where p.id = path_id and p.user_id = auth.uid()))
  with check (exists (select 1 from paths p where p.id = path_id and p.user_id = auth.uid()));

-- 3. Migrate: every user with starred (in_list) resources gets one
--    default path named after their old single-path name, holding
--    those resources in their old order. Idempotent.
insert into paths (user_id, name)
select distinct m.user_id, coalesce(pr.path_name, 'My learning path')
from my_path m
left join profiles pr on pr.id = m.user_id
where m.in_list
  and not exists (select 1 from paths p where p.user_id = m.user_id);

insert into path_items (path_id, resource_id, position)
select fp.id, m.resource_id, m.position
from my_path m
join lateral (
  select id from paths p
  where p.user_id = m.user_id
  order by p.position, p.created_at
  limit 1
) fp on true
where m.in_list
  and not exists (
    select 1 from path_items pi
    where pi.path_id = fp.id and pi.resource_id = m.resource_id
  );
