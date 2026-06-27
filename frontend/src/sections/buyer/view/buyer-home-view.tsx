import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { RouterLink } from 'src/routes/components';

import { useAsync } from 'src/hooks/use-async';
import { useRealtimeRefetch } from 'src/hooks/use-realtime';

import { fDate } from 'src/utils/format-time';

import { useAuth } from 'src/auth';
import { fPeso } from 'src/data/pricing';
import { fetchMyOrders, fetchMyNotifications } from 'src/services/db';

import { Iconify } from 'src/components/iconify';
import { OfflineNotice } from 'src/components/offline-notice';

import { BuyerStatusBadge } from '../buyer-status-badge';

// ----------------------------------------------------------------------
// B-3. Buyer Home / Dashboard — responsive interface + live order data.
// ----------------------------------------------------------------------

export function BuyerHomeView() {
  const { user, profile } = useAuth();
  const firstName = profile?.full_name?.trim().split(' ')[0] || 'there';

  const { data, refetch } = useAsync(async () => {
    if (!user) return { orders: [], unread: 0 };
    const [orders, notifs] = await Promise.all([
      fetchMyOrders(user.id),
      fetchMyNotifications(user.id),
    ]);
    return { orders, unread: notifs.filter((n) => !n.read).length };
  }, [user?.id]);

  // Live-update orders + the bell badge when they change in Supabase.
  useRealtimeRefetch(['orders', 'notifications'], refetch);

  const orders = useMemo(() => data?.orders ?? [], [data]);
  const unread = data?.unread ?? 0;

  const stats = useMemo(() => {
    const active = orders.filter(
      (o) => o.type === 'order' && !['completed', 'cancelled'].includes(o.status)
    ).length;
    const reservations = orders.filter(
      (o) => o.type === 'reservation' && !['completed', 'cancelled'].includes(o.status)
    ).length;
    const completed = orders.filter((o) => o.status === 'completed').length;
    return { active, reservations, completed };
  }, [orders]);

  const recent = orders.slice(0, 4);

  return (
    <Box>
      {/* Top bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Hi,
          </Typography>
          <Typography variant="h5">{firstName} 👋</Typography>
        </Box>
        <IconButton component={RouterLink} href="/cart">
          <Iconify icon="solar:cart-large-2-bold-duotone" width={26} />
        </IconButton>
        <IconButton component={RouterLink} href="/buyer/notifications">
          <Badge badgeContent={unread} color="error">
            <Iconify icon="solar:bell-bing-bold-duotone" width={26} />
          </Badge>
        </IconButton>
      </Box>

      <OfflineNotice />

      {/* Quick status cards */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
        <StatCard label="Active Orders" value={stats.active} color="warning.main" />
        <StatCard label="Reservations" value={stats.reservations} color="primary.main" />
        <StatCard label="Completed" value={stats.completed} color="success.main" />
      </Box>

      {/* Shortcuts */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
        <Button
          fullWidth
          variant="contained"
          component={RouterLink}
          href="/catalog"
          startIcon={<Iconify icon="solar:shop-2-bold" />}
        >
          Browse Shop
        </Button>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          component={RouterLink}
          href="/visual-search"
          startIcon={<Iconify icon="solar:camera-bold" />}
        >
          Visual Search
        </Button>
      </Box>

      {/* Recent activity */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Recent activity
        </Typography>
        <Button component={RouterLink} href="/buyer/orders" size="small" color="inherit">
          View all
        </Button>
      </Box>

      {recent.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Iconify icon="solar:bag-smile-bold-duotone" width={56} sx={{ color: 'text.disabled' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, mb: 2 }}>
            You haven&apos;t placed any orders yet.
          </Typography>
          <Button variant="contained" component={RouterLink} href="/catalog">
            Start Shopping
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {recent.map((order) => (
            <Card
              key={order.id}
              component={RouterLink}
              href={`/buyer/orders/${order.id}`}
              sx={{ p: 2, display: 'block', textDecoration: 'none', color: 'inherit' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                  {order.code}
                </Typography>
                <BuyerStatusBadge order={order} />
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {order.items.map((i) => i.name).join(', ')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', flexGrow: 1 }}>
                  {fDate(order.createdAt)}
                </Typography>
                <Typography variant="subtitle2">{fPeso(order.estTotal)}</Typography>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card sx={{ flex: 1, p: 2, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ color }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Card>
  );
}
