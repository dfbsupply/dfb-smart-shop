import type { Banner } from 'src/data/types';

import { supabase } from 'src/lib/supabase';

import { mapPromo } from './mappers';

// ----------------------------------------------------------------------
// Promo banners (Admin A-7 → Webshop W-1). Admins read all; public reads
// only active banners (RLS). Ordered by the banner sort order.
// ----------------------------------------------------------------------

export async function fetchPromos(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('promos')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapPromo);
}

// Storefront — only active banners, regardless of who is signed in.
export async function fetchActivePromos(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('promos')
    .select('*')
    .eq('status', 'active')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapPromo);
}
