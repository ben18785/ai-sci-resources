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
