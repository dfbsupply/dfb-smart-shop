import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';

import { fPeso } from 'src/data/pricing';
import { getBuyerOrders } from 'src/data/mock';

import { Iconify } from 'src/components/iconify';

import { BuyerStatusBadge } from '../buyer-status-badge';

// ----------------------------------------------------------------------
// B-4. My Orders Page — orders synced from Firebase (Objective 4).
// ----------------------------------------------------------------------

type FilterTab = 'all' | 'active' | 'reservations' | 'completed' | 'cancelled';

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'reservations', label: 'Reservations' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function BuyerOrdersView() {
  const [tab, setTab] = useState<FilterTab>('all');
  const orders = useMemo(() => getBuyerOrders(), []);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        switch (tab) {
          case 'active':
            return !['completed', 'cancelled'].includes(o.status);
          case 'reservations':
            return o.type === 'reservation';
          case 'completed':
            return o.status === 'completed';
          case 'cancelled':
            return o.status === 'cancelled';
          default:
            return true;
        }
      }),
    [orders, tab]
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My Orders
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      {filtered.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Iconify icon="solar:bag-cross-bold-duotone" width={48} sx={{ color: 'text.disabled' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            No orders here yet.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((order) => (
            <Card key={order.id} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                  {order.code}
                </Typography>
                <BuyerStatusBadge order={order} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {fDate(order.createdAt)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {order.items
                  .map((i) => `${i.name} ${i.width}×${i.height}`)
                  .join(' + ')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Estimated total
                  </Typography>
                  <Typography variant="subtitle1">{fPeso(order.estTotal)}</Typography>
                </Box>
                <Button
                  component={RouterLink}
                  href={`/buyer/orders/${order.id}`}
                  variant="outlined"
                  color="inherit"
                  size="small"
                >
                  View Details
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
