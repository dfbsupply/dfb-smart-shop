// ----------------------------------------------------------------------
// Supabase client — the single place the app talks to Supabase
// (Auth + Postgres + Storage). Replaces the inert Firebase module.
//
// Config is read from Vite env vars (see frontend/.env.example). Both values
// are public-safe: the URL and the publishable/anon key ship in the browser,
// and Row-Level Security (applied in supabase/apply_all.sql) is what actually
// guards the data.
// ----------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // Surfaced once at startup so a missing .env.local is obvious in dev.
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — ' +
      'copy .env.example to .env.local and fill them in.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
