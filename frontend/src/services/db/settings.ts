import type { ShopSettings } from 'src/data/types';

import { supabase } from 'src/lib/supabase';

import { mapSettings } from './mappers';

// ----------------------------------------------------------------------
// Shop settings (Admin A-10). The singleton settings row + the main branch
// together form the UI ShopSettings. Public-readable under RLS.
// ----------------------------------------------------------------------

export async function fetchSettings(): Promise<ShopSettings | null> {
  const [settingsRes, branchRes] = await Promise.all([
    supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('branches').select('*').eq('is_main', true).maybeSingle(),
  ]);
  if (settingsRes.error) throw settingsRes.error;
  if (!settingsRes.data) return null;
  return mapSettings(settingsRes.data, branchRes.data ?? undefined);
}
