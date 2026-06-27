import { useAsync } from 'src/hooks/use-async';
import { useRealtimeRefetch } from 'src/hooks/use-realtime';

import { fetchMyNotifications } from 'src/services/db';

// ----------------------------------------------------------------------
// Live unread-notification count for the signed-in buyer. Recounts whenever a
// row changes in the `notifications` table (so the bell badge bumps the moment
// an admin sends one). Realtime respects RLS, so a buyer only sees their own.
// Requires `notifications` in the supabase_realtime publication.
// ----------------------------------------------------------------------

export function useUnreadNotifications(userId?: string): number {
  const { data, refetch } = useAsync(async () => {
    if (!userId) return 0;
    const notifs = await fetchMyNotifications(userId);
    return notifs.filter((n) => !n.read).length;
  }, [userId]);

  useRealtimeRefetch('notifications', refetch);

  return data ?? 0;
}
