import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------
// Live rider tracking over Supabase Realtime *broadcast* (ephemeral, no DB
// table). The rider page broadcasts its GPS position on a per-order channel;
// the customer's order page subscribes and moves the pin in real time.
// ----------------------------------------------------------------------

export type RiderLoc = { lat: number; lng: number; at: number };

const channelName = (orderId: string) => `order-tracking:${orderId}`;

// Customer side: listen for the rider's location. Returns an unsubscribe fn.
export function subscribeRiderLocation(orderId: string, onLoc: (loc: RiderLoc) => void): () => void {
  const channel = supabase
    .channel(channelName(orderId), { config: { broadcast: { self: false } } })
    .on('broadcast', { event: 'loc' }, ({ payload }) => onLoc(payload as RiderLoc))
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Rider side: a broadcaster that pushes the rider's location to the channel.
export function createRiderBroadcaster(orderId: string) {
  const channel = supabase.channel(channelName(orderId));
  channel.subscribe();
  return {
    send: (loc: RiderLoc) => channel.send({ type: 'broadcast', event: 'loc', payload: loc }),
    stop: () => supabase.removeChannel(channel),
  };
}
