-- ============================================================================
-- ZC Network — admin "remove member" RPC.
-- Deletes the profile AND the underlying auth user (so a removed person can't
-- get stuck on a half-deleted account, and can register again later).
-- Run AFTER schema.sql. Safe to re-run.
-- ============================================================================
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
  delete from public.profiles where id = target;        -- handles demo rows (no auth user)
  if uid is not null then
    delete from auth.users where id = uid;              -- real accounts: remove login too
  end if;
end;
$$;

grant execute on function public.admin_remove_member(uuid) to authenticated;
