import type { Fulfilment } from 'src/data/types';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------
// Buyer profile (Buyer B-7). A buyer may read and update their own profile
// (profiles_self_* RLS policies). The auth context already exposes the loaded
// profile for reads; this module handles persistence.
// ----------------------------------------------------------------------

export type ProfilePatch = {
  full_name?: string;
  mobile?: string | null;
  email?: string | null;
  preference?: Fulfilment;
  address?: string | null;
};

export async function updateProfile(id: string, patch: ProfilePatch): Promise<void> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if (error) throw error;
}
