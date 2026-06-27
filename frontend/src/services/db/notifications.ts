import type { Notification as DbNotification } from 'src/lib/database.types';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------
// Buyer notifications (Buyer B-8). RLS limits rows to the signed-in buyer;
// a buyer may mark their own notifications read.
// ----------------------------------------------------------------------

export type BuyerNotification = {
  id: string;
  text: string;
  createdAt: string;
  read: boolean;
  type: 'order' | 'promo';
};

function mapNotification(db: DbNotification): BuyerNotification {
  return {
    id: db.id,
    text: db.text,
    createdAt: db.created_at,
    read: db.read,
    type: db.type,
  };
}

export async function fetchMyNotifications(userId: string): Promise<BuyerNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DbNotification[]).map(mapNotification);
}

// Admin-only (RLS): create a notification for a buyer — e.g. when their order's
// confirmed price changes. Caller should skip this for guest orders (no user).
export async function createNotification(
  userId: string,
  text: string,
  type: 'order' | 'promo' = 'order'
): Promise<void> {
  const { error } = await supabase.from('notifications').insert({ user_id: userId, text, type });
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
}
