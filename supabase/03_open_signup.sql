-- ============================================================================
-- ZC Network — open signup (no email-confirmation wait).
-- Run this if you want users to sign up and log in immediately, with admin
-- approval gating only their VISIBILITY in the directory (not their login).
--
-- Why: depending on your Supabase version the "Confirm email" toggle may be
-- missing from the dashboard. This achieves the same result from SQL.
-- ============================================================================

-- 1. Confirm everyone who is currently stuck unconfirmed (unblocks existing
--    accounts like the one you just created).
update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;

-- 2. Auto-confirm every FUTURE signup, so login works right away.
create or replace function public.auto_confirm_email()
returns trigger
language plpgsql
security definer
set search_path = auth
as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

drop trigger if exists auto_confirm_email_trg on auth.users;
create trigger auto_confirm_email_trg
  before insert on auth.users
  for each row execute function public.auto_confirm_email();

-- Note: this disables email verification. For this alumni directory that's fine
-- — admin approval is the real gate. If you later want real email verification
-- for production, drop auto_confirm_email_trg and enable "Confirm email" in
-- Authentication settings.
