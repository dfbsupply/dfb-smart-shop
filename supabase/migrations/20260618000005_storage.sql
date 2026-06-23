-- ============================================================================
-- DFB Smart Shop — Product image storage (Phase 9)
-- A public bucket for product photos. Anyone can READ (so the storefront and
-- visual-search results can show images); only admins can upload/replace/delete.
-- Run this once in the Supabase SQL Editor.
-- ============================================================================

-- 1) The bucket (public read via the object URL).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2) Policies on storage.objects scoped to this bucket.
--    (Public buckets serve objects by URL; uploads still need an insert policy.)
drop policy if exists "product_images_public_read"   on storage.objects;
drop policy if exists "product_images_admin_insert"  on storage.objects;
drop policy if exists "product_images_admin_update"  on storage.objects;
drop policy if exists "product_images_admin_delete"  on storage.objects;

create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
