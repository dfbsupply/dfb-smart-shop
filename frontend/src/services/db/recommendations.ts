import type { Recommendation } from 'src/data/types';
import type { Recommendation as DbRecommendation } from 'src/lib/database.types';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------
// Recommendations (Admin A-8). Stored one row per (product, add-on); the UI
// groups them into { productId, addonIds[] }. Public-readable under RLS.
// ----------------------------------------------------------------------

export async function fetchRecommendations(): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;

  const grouped = new Map<string, string[]>();
  for (const row of (data ?? []) as DbRecommendation[]) {
    const list = grouped.get(row.product_id) ?? [];
    list.push(row.addon_id);
    grouped.set(row.product_id, list);
  }
  return Array.from(grouped, ([productId, addonIds]) => ({ productId, addonIds }));
}
