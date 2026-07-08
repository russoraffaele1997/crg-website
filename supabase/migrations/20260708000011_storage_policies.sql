-- The 'media' bucket itself is created as public (via the Storage API, not
-- SQL) so anonymous GET requests to the public object URL work without a
-- policy. Writes still go through storage.objects RLS, which is enabled by
-- default with no policies (= no access), so admins need explicit grants.
create policy "admins can upload media objects"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "admins can update media objects"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy "editors can delete media objects"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.has_role(array['super_admin','editor']::app_role[]));
