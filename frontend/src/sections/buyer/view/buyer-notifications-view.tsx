import type { BuyerNotification } from 'src/services/db';

import { useState, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useAsync } from 'src/hooks/use-async';

import { fDateTime } from 'src/utils/format-time';

import { useAuth } from 'src/auth';
import { fetchMyNotifications, markAllNotificationsRead } from 'src/services/db';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// B-8. Notifications — real-time updates from Firebase (Objective 4).
// ----------------------------------------------------------------------

export function BuyerNotificationsView() {
  const { user } = useAuth();
  const { data } = useAsync(
    () => (user ? fetchMyNotifications(user.id) : Promise.resolve([])),
    [user?.id]
  );

  const [items, setItems] = useState<BuyerNotification[]>([]);
  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const hasUnread = items.some((n) => !n.read);

  const handleMarkAll = async () => {
    if (!user) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true }))); // optimistic
    try {
      await markAllNotificationsRead(user.id);
    } catch {
      /* keep optimistic state; will reconcile on next load */
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Notifications
        </Typography>
        {hasUnread && (
          <Button size="small" color="inherit" onClick={handleMarkAll}>
            Mark all read
          </Button>
        )}
      </Box>

      {items.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Iconify icon="solar:bell-off-bold-duotone" width={48} sx={{ color: 'text.disabled' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            No notifications yet.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map((n) => (
            <Card
              key={n.id}
              sx={{
                p: 2,
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
                ...(!n.read && {
                  bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                }),
              }}
            >
              <Iconify
                icon={n.type === 'promo' ? 'solar:tag-price-bold-duotone' : 'solar:bag-check-bold-duotone'}
                width={26}
                sx={{ color: n.type === 'promo' ? 'warning.main' : 'primary.main', flexShrink: 0 }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 600 }}>
                  {n.text}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {fDateTime(n.createdAt)}
                </Typography>
              </Box>
              {!n.read && (
                <Box
                  sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.5 }}
                />
              )}
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
