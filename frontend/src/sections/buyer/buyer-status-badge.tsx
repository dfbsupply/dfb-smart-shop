import type { Order } from 'src/data/types';

import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  RESERVATION_STATUS_LABEL,
} from 'src/data/status';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------
// Buyer-facing status badge: reservations use the "Reserved / Released /
// Expired" wording; regular orders use the standard stage labels.
// ----------------------------------------------------------------------

export function BuyerStatusBadge({ order }: { order: Order }) {
  const label =
    order.type === 'reservation'
      ? RESERVATION_STATUS_LABEL[order.status]
      : ORDER_STATUS_LABEL[order.status];

  return <Label color={ORDER_STATUS_COLOR[order.status]}>{label}</Label>;
}
