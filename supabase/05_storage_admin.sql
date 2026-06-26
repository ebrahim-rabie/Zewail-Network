-- ============================================================================
-- ZC Network — let admins delete any avatar (so removing a member also frees
-- their photo from Storage). Run AFTER schema.sql / 02_updates.sql.
-- ============================================================================
drop policy if exists "avatars admin delete" on storage.objects;
create policy "avatars admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and public.is_admin());
