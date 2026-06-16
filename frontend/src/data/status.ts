import type { LabelColor } from 'src/components/label';

import type { Product, OrderStatus, StockStatus } from './types';

// ----------------------------------------------------------------------
// Stock status — auto-flagged from quantity vs threshold (A-5).
// ----------------------------------------------------------------------

export function getStockStatus(product: Pick<Product, 'stockQty' | 'lowStockThreshold'>): StockStatus {
  if (product.stockQty <= 0) return 'out_of_stock';
  if (product.stockQty <= product.lowStockThreshold) return 'low_stock';
  return 'in_stock';
}

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

export const STOCK_STATUS_COLOR: Record<StockStatus, LabelColor> = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'error',
};

// ----------------------------------------------------------------------
// Order status — manual, shop-set stages only (no courier tracking).
// ----------------------------------------------------------------------

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'New',
  pending: 'Pending',
  confirmed: 'Confirmed',
  ready: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, LabelColor> = {
  new: 'info',
  pending: 'warning',
  confirmed: 'primary',
  ready: 'secondary',
  completed: 'success',
  cancelled: 'error',
};

// Stages an admin can move an order through (Cancelled is always available).
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'ready',
  'completed',
];

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'new',
  'pending',
  'confirmed',
  'ready',
  'completed',
  'cancelled',
];

// ----------------------------------------------------------------------
// Reservation view (B-6) — same underlying status, buyer-facing labels for
// orders flagged as reservations (stock set aside).
// ----------------------------------------------------------------------

export const RESERVATION_STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Reserved',
  pending: 'Reserved',
  confirmed: 'Confirmed',
  ready: 'Ready for Pickup',
  completed: 'Released',
  cancelled: 'Expired',
};
