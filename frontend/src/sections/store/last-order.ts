// ----------------------------------------------------------------------
// Holds the most recently placed order so the confirmation page (W-7) can
// recap it after checkout. Persisted to localStorage so a refresh on the
// confirmation page still works. (Replaced by a Firebase write + read later.)
// ----------------------------------------------------------------------

export type PlacedOrderItem = {
  name: string;
  image: string;
  width: number;
  height: number;
  qty: number;
  unitPrice: number;
};

export type PlacedOrder = {
  code: string;
  customerName: string;
  customerMobile: string;
  fulfilment: 'pickup' | 'delivery';
  items: PlacedOrderItem[];
  estTotal: number;
};

const KEY = 'dfb-last-order';

export function saveLastOrder(order: PlacedOrder) {
  try {
    localStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    /* ignore */
  }
}

export function readLastOrder(): PlacedOrder | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PlacedOrder) : null;
  } catch {
    return null;
  }
}
