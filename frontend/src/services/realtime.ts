import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------
// Objective 4 — real-time data pipeline. Subscribes to Postgres changes
// (insert / update / delete) on a table via Supabase Realtime and invokes a
// callback so the UI can refresh live. Respects Row-Level Security: a client
// only receives changes for rows it is allowed to read.
//
// NOTE: each table must be added to the `supabase_realtime` publication once,
// in the Supabase SQL editor:
//   alter publication supabase_realtime add table public.orders;
//   alter publication supabase_realtime add table public.products;
//   alter publication supabase_realtime add table public.promos;
// ----------------------------------------------------------------------

// Monotonic id so every subscription gets a distinct channel topic. Two
// components can subscribe to the same table concurrently (e.g. the buyer
// layout's unread badge and the buyer home view both watch `notifications`);
// without a unique suffix they'd share the topic `realtime:<table>`, and
// supabase-js would hand the second caller the already-subscribed channel —
// making the `.on('postgres_changes', …)` call throw.
let channelSeq = 0;

export function subscribeTable(table: string, onChange: () => void): () => void {
  channelSeq += 1;
  const channel = supabase
    .channel(`realtime:${table}:${channelSeq}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, () => onChange())
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
