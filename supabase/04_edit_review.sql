-- ============================================================================
-- ZC Network — edit-review workflow + soft delete (run AFTER earlier files).
-- Safe to re-run.
--   * Approved members' edits are staged in `draft` and need admin approval
--     before going public (their live profile keeps showing the approved data).
--   * "Remove" becomes a soft delete (status='removed') so a removed user no
--     longer gets stuck on a half-existing account.
-- ============================================================================

-- 1. New columns -------------------------------------------------------------
alter table public.profiles add column if not exists draft jsonb;
alter table public.profiles add column if not exists pending_review boolean not null default false;

-- 2. Allow the 'removed' status ---------------------------------------------
alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles add constraint profiles_status_check
  check (status in ('pending','approved','rejected','suspended','removed'));

create index if not exists profiles_pending_review_idx on public.profiles (pending_review);

-- 3. Privilege guard: freeze admin-only & live fields for authenticated users
--    Approved/suspended members may only stage changes in `draft` +
--    `pending_review`; their public columns are frozen until an admin applies
--    the draft. Pending/rejected members (not yet public) edit live directly.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    -- never self-serviceable
    new.status := old.status;
    new.account_role := old.account_role;
    new.links := old.links;             -- useful links are admin-curated

    if old.status in ('approved','suspended') then
      -- freeze every public/live column; only draft + pending_review may change
      new.full_name       := old.full_name;
      new.photo_url        := old.photo_url;
      new.about            := old.about;
      new.location         := old.location;
      new.school           := old.school;
      new.major            := old.major;
      new.major_short      := old.major_short;
      new.started_year     := old.started_year;
      new.grad_year        := old.grad_year;
      new.current_title    := old.current_title;
      new.current_company  := old.current_company;
      new.career_path      := old.career_path;
      new.experiences      := old.experiences;
      new.email            := old.email;
      new.phone            := old.phone;
      new.linkedin         := old.linkedin;
      new.github           := old.github;
      new.twitter          := old.twitter;
      new.privacy          := old.privacy;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
