-- ============================================================================
-- ZC Network — incremental updates (run AFTER schema.sql, on your existing DB).
-- Safe to re-run. Adds: useful links, Storage policies for photo upload, and
-- fixes the admin-promotion trigger.
-- ============================================================================

-- 1. Useful links (admin-curated, always public) -----------------------------
alter table public.profiles
  add column if not exists links jsonb not null default '[]'::jsonb;

-- 2. Rebuild the directory view to expose `links` ----------------------------
-- DROP first: CREATE OR REPLACE VIEW can't insert a new column mid-list.
drop view if exists public.directory_profiles;
create view public.directory_profiles as
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

-- 3. Fix the privilege-guard trigger -----------------------------------------
-- Previously this froze status/account_role for ANY non-admin, which also
-- blocked legitimate updates from the SQL editor (auth.uid() is null there),
-- silently reverting admin promotions. Now it only restricts authenticated
-- end-users.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.status := old.status;
    new.account_role := old.account_role;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- 4. Storage policies for the `avatars` bucket -------------------------------
-- Files live under "<auth.uid>/avatar.ext"; members manage only their folder.
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

-- 5. Promote yourself to admin (CHANGE THE EMAIL). Run this LAST. ------------
-- update public.profiles
-- set account_role = 'admin', status = 'approved'
-- where email = 'you@zc.edu.eg';
