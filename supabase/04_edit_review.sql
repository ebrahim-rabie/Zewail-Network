-- ============================================================================
-- ZC Network — edit-review workflow (run AFTER 01–03; safe to re-run).
--
-- Model:
--   * New signups fill their profile LIVE while status = 'pending', then an
--     admin approves them ("New account" request).
--   * Once approved, a member's edits are staged in `draft` + pending_review=true.
--     Their PUBLIC profile keeps showing the last approved data until an admin
--     approves the change ("Edit" request), which applies the draft.
-- ============================================================================

-- 1. Columns -----------------------------------------------------------------
alter table public.profiles add column if not exists draft jsonb;
alter table public.profiles add column if not exists pending_review boolean not null default false;
create index if not exists profiles_pending_review_idx on public.profiles (pending_review);

-- 2. Privilege guard ---------------------------------------------------------
-- Authenticated non-admins can never change status/account_role/links. Once
-- approved/suspended, their public columns are frozen too — only `draft` and
-- `pending_review` may change. Pending/rejected members (not yet public) edit
-- live directly. Admins and the SQL editor (auth.uid() null) bypass all of this.
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
    new.links := old.links;

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

-- 3. admin_apply_draft(): approve a staged edit -> copy draft into live columns
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

-- Reject-an-edit is just an admin update setting pending_review=false, draft=null
-- (allowed by the admin RLS policy), so no separate function is needed.
