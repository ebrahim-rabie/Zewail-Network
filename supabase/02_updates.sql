-- ============================================================================
-- ZC Network — incremental updates (run AFTER schema.sql, on your existing DB).
-- Adds: admin-curated useful links, and Storage RLS policies so members can
-- upload their own profile photo.
-- ============================================================================

-- 1. Useful links (admin-curated, always public) -----------------------------
alter table public.profiles
  add column if not exists links jsonb not null default '[]'::jsonb;

-- 2. Rebuild the directory view to expose `links` --------------------------
create or replace view public.directory_profiles as
select
  id,
  full_name,
  photo_url,
  school,
  major,
  major_short,
  started_year,
  grad_year,
  current_title,
  current_company,
  career_path,
  links,
  case when coalesce((privacy->>'about')::boolean, true)    then about    end as about,
  case when coalesce((privacy->>'location')::boolean, true) then location end as location,
  case when coalesce((privacy->>'work')::boolean, true) then experiences else '[]'::jsonb end as experiences,
  case when coalesce((privacy->>'email')::boolean, true)    then email    end as email,
  case when coalesce((privacy->>'phone')::boolean, false)   then phone    end as phone,
  case when coalesce((privacy->>'linkedin')::boolean, true) then linkedin end as linkedin,
  case when coalesce((privacy->>'github')::boolean, true)   then github   end as github,
  case when coalesce((privacy->>'twitter')::boolean, false) then twitter  end as twitter
from public.profiles
where status = 'approved';

grant select on public.directory_profiles to anon, authenticated;

-- 3. Storage policies for the `avatars` bucket ------------------------------
-- Files are stored under a folder named after the uploader's auth uid, e.g.
-- "<auth.uid>/avatar.png". These policies let a member manage only their own
-- folder, while anyone can read (the bucket is public).
drop policy if exists "avatars public read"  on storage.objects;
drop policy if exists "avatars owner insert" on storage.objects;
drop policy if exists "avatars owner update" on storage.objects;
drop policy if exists "avatars owner delete" on storage.objects;

create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars owner insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
