import { useMemo } from 'react';

import { useAsync } from 'src/hooks/use-async';

import { fPeso } from 'src/data/pricing';
import { fetchOrders } from 'src/services/db';
import { ORDER_STATUS_LABEL } from 'src/data/status';

import { NotificationsPopover } from './notifications-popover';

// ----------------------------------------------------------------------
// Admin notifications — a real feed built from the most recent orders
// (newest first). Orders still needing attention (new / pending) show as
// unread. "View all" jumps to the Orders page.
// ----------------------------------------------------------------------

const NEEDS_ATTENTION = ['new', 'pending'];

export function AdminNotifications() {
  const { data } = useAsync(() => fetchOrders(), []);

  const notifications = useMemo(
    () =>
      (data ?? []).slice(0, 5).map((order) => ({
        id: order.id,
        type: order.fulfilment === 'delivery' ? 'order-shipped' : 'order-placed',
        title: `Order ${order.code}`,
        description: `${ORDER_STATUS_LABEL[order.status]} · ${order.customerName} · ${fPeso(
          order.confirmedAmount ?? order.estTotal
        )}`,
        avatarUrl: null,
        postedAt: order.createdAt,
        isUnRead: NEEDS_ATTENTION.includes(order.status),
      })),
    [data]
  );

  return <NotificationsPopover data={notifications} viewAllHref="/admin/orders" />;
}
