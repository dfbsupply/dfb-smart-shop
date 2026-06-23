import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------
// Product image storage (Supabase Storage, bucket "product-images").
// Public read; admin-only write (enforced by storage RLS). Used by the admin
// product form so the owner can upload real product photos.
// ----------------------------------------------------------------------

const BUCKET = 'product-images';

export async function uploadProductImage(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `products/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Best-effort delete of a previously uploaded image by its public URL.
// (No-op for non-storage URLs like the old /assets placeholders.)
export async function deleteProductImage(publicUrl: string): Promise<void> {
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
