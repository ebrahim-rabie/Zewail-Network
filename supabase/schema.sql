-- ============================================================================
-- ZC Network — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.
-- It is idempotent enough to re-run during development.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles table
-- ----------------------------------------------------------------------------
-- `user_id` links a row to an auth user. It is nullable so demo/seed graduates
-- can exist without an auth account. Real members get it set by the signup
-- trigger below.
create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique references auth.users (id) on delete cascade,
  full_name     text not null default '',
  email         text,
  photo_url     text,
  about         text,
  location      text,
  school        text,
  major         text,
  major_short   text,
  started_year  int,
  grad_year     int,
  current_title  text,
  current_company text,
  career_path   text default 'job',
  experiences   jsonb not null default '[]'::jsonb,
  phone         text,
  linkedin      text,
  github        text,
  twitter       text,
  links         jsonb not null default '[]'::jsonb,  -- admin-curated useful links (always public)
  draft         jsonb,                                -- staged edit awaiting admin review
  pending_review boolean not null default false,
  privacy       jsonb not null default
                  '{"about":true,"location":true,"work":true,"email":true,"phone":false,"linkedin":true,"github":true,"twitter":false}'::jsonb,
  status        text not null default 'pending'
                  check (status in ('pending','approved','rejected','suspended')),
  account_role  text not null default 'alumni'
                  check (account_role in ('alumni','admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists profiles_status_idx on public.profiles (status);

-- ----------------------------------------------------------------------------
-- 2. is_admin() — SECURITY DEFINER so it can read the profiles table from
--    inside RLS policies without recursing into those same policies.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and account_role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- 3. Signup trigger — provision a pending profile row for each new auth user.
--    full_name comes from the metadata the client passes to supabase.auth.signUp.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, email, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    'pending'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. Prevent privilege escalation — non-admins cannot change their own
--    status or account_role through the normal update path.
-- ----------------------------------------------------------------------------
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only restrict authenticated END-USERS. When auth.uid() is null (SQL editor,
  -- service-role key, the signup trigger) the update is privileged — allow it,
  -- so admins can be promoted from the dashboard SQL editor.
  if auth.uid() is not null and not public.is_admin() then
    new.status := old.status;
    new.account_role := old.account_role;
    new.links := old.links;  -- useful links are admin-curated

    -- Approved/suspended members can't edit live columns directly; their changes
    -- are staged in `draft` + pending_review and applied by an admin.
    if old.status in ('approved','suspended') then
      new.full_name       := old.full_name;
      new.photo_url       := old.photo_url;
      new.about           := old.about;
      new.location        := old.location;
      new.school          := old.school;
      new.major           := old.major;
      new.major_short     := old.major_short;
      new.started_year    := old.started_year;
      new.grad_year       := old.grad_year;
      new.current_title   := old.current_title;
      new.current_company := old.current_company;
      new.career_path     := old.career_path;
      new.experiences     := old.experiences;
      new.email           := old.email;
      new.phone           := old.phone;
      new.linkedin        := old.linkedin;
      new.github          := old.github;
      new.twitter         := old.twitter;
      new.privacy         := old.privacy;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_profile_fields_trg on public.profiles;
create trigger protect_profile_fields_trg
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ----------------------------------------------------------------------------
-- 5. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Members can read their own row (full, unmasked — used by the dashboard).
drop policy if exists "own profile readable" on public.profiles;
create policy "own profile readable" on public.profiles
  for select using (user_id = auth.uid());

-- Admins can read every row (used by the admin panel).
drop policy if exists "admin reads all" on public.profiles;
create policy "admin reads all" on public.profiles
  for select using (public.is_admin());

-- Members can update their own row (status/account_role are frozen by the
-- protect_profile_fields trigger above).
drop policy if exists "own profile editable" on public.profiles;
create policy "own profile editable" on public.profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Admins can update any row (approve / reject / suspend / restore).
drop policy if exists "admin updates all" on public.profiles;
create policy "admin updates all" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- Admins can delete (remove a member).
drop policy if exists "admin deletes" on public.profiles;
create policy "admin deletes" on public.profiles
  for delete using (public.is_admin());

-- NOTE: there is deliberately no anon/public SELECT policy on the base table,
-- so private fields never leave the database. Guests read the masked view below.

-- ----------------------------------------------------------------------------
-- 6. directory_profiles — the public, privacy-masked view.
--    Runs with the view owner's privileges (security_invoker = off, the default),
--    so it bypasses RLS, returns only approved members, and nulls out any field
--    the owner marked private. Guests and other members read from here.
-- ----------------------------------------------------------------------------
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
  -- masked fields ---------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 7. Storage policies for the `avatars` bucket (create the bucket first, public).
--    Files live under "<auth.uid>/avatar.ext"; members manage only their folder.
-- ----------------------------------------------------------------------------
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
-- Admins may delete any avatar (used when removing a member).
drop policy if exists "avatars admin delete" on storage.objects;
create policy "avatars admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. admin_remove_member(): delete a member's profile AND their auth account.
-- ----------------------------------------------------------------------------
create or replace function public.admin_remove_member(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can remove members';
  end if;
  select user_id into uid from public.profiles where id = target;
  delete from public.profiles where id = target;
  if uid is not null then
    delete from auth.users where id = uid;
  end if;
end;
$$;

grant execute on function public.admin_remove_member(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 9. admin_apply_draft(): approve a staged edit by copying draft -> live columns.
-- ----------------------------------------------------------------------------
create or replace function public.admin_apply_draft(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare d jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only admins can approve edits';
  end if;
  select draft into d from public.profiles where id = target;
  if d is null then
    update public.profiles set pending_review = false where id = target;
    return;
  end if;
  update public.profiles set
    full_name       = coalesce(d->>'full_name', full_name),
    photo_url       = d->>'photo_url',
    about           = d->>'about',
    location        = d->>'location',
    school          = d->>'school',
    major           = d->>'major',
    major_short     = d->>'major_short',
    started_year    = nullif(d->>'started_year','')::int,
    grad_year       = nullif(d->>'grad_year','')::int,
    current_title   = d->>'current_title',
    current_company = d->>'current_company',
    career_path     = coalesce(d->>'career_path','job'),
    experiences     = coalesce(d->'experiences','[]'::jsonb),
    email           = d->>'email',
    phone           = d->>'phone',
    linkedin        = d->>'linkedin',
    github          = d->>'github',
    twitter         = d->>'twitter',
    privacy         = coalesce(d->'privacy', privacy),
    pending_review  = false,
    draft           = null
  where id = target;
end;
$$;

grant execute on function public.admin_apply_draft(uuid) to authenticated;
