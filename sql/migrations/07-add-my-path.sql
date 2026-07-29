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
