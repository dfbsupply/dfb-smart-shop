import { computeUnitPrice } from './pricing';

import type {
  Order,
  Banner,
  Product,
  ShopSettings,
  Recommendation,
} from './types';

// ----------------------------------------------------------------------
// Mock data standing in for the Firebase Realtime Database. Replace these
// exports with live `onValue` subscriptions when wiring Firebase.
// ----------------------------------------------------------------------

const img = (n: number) => `/assets/images/product/product-${n}.webp`;

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Clear Float Glass 5mm',
    category: 'Glass',
    description: 'Standard clear float glass, ideal for windows and table tops.',
    basePrice: 320,
    stockQty: 48,
    lowStockThreshold: 10,
    images: [img(1)],
    keywords: ['glass', 'window', 'clear', 'sheet'],
    visibleInShop: true,
    availableForReservation: true,
  },
  {
    id: 'p2',
    name: 'Tinted Bronze Glass 6mm',
    category: 'Glass',
    description: 'Heat-reducing tinted glass for façades and partitions.',
    basePrice: 480,
    stockQty: 6,
    lowStockThreshold: 8,
    images: [img(2)],
    keywords: ['glass', 'tinted', 'bronze', 'window'],
    visibleInShop: true,
    availableForReservation: true,
  },
  {
    id: 'p3',
    name: 'Aluminum Sliding Profile',
    category: 'Aluminum Profiles',
    description: 'Powder-coated sliding track profile for windows and doors.',
    basePrice: 250,
    stockQty: 120,
    lowStockThreshold: 20,
    images: [img(3)],
    keywords: ['aluminum', 'profile', 'frame', 'metal', 'track'],
    visibleInShop: true,
    availableForReservation: true,
  },
  {
    id: 'p4',
    name: 'Aluminum Casement Profile',
    category: 'Aluminum Profiles',
    description: 'Durable casement window profile, mill finish.',
    basePrice: 270,
    stockQty: 0,
    lowStockThreshold: 15,
    images: [img(4)],
    keywords: ['aluminum', 'profile', 'frame', 'casement', 'metal'],
    visibleInShop: true,
    availableForReservation: false,
  },
  {
    id: 'p5',
    name: 'Window Lock Set',
    category: 'Hardware & Accessories',
    description: 'Crescent lock set for sliding windows.',
    basePrice: 95,
    stockQty: 7,
    lowStockThreshold: 12,
    images: [img(5)],
    keywords: ['lock', 'hardware', 'window', 'accessory'],
    visibleInShop: true,
    availableForReservation: false,
  },
  {
    id: 'p6',
    name: 'Stainless Door Handle',
    category: 'Hardware & Accessories',
    description: 'Brushed stainless handle for aluminum doors.',
    basePrice: 180,
    stockQty: 35,
    lowStockThreshold: 10,
    images: [img(6)],
    keywords: ['handle', 'hardware', 'door', 'stainless'],
    visibleInShop: true,
    availableForReservation: false,
  },
  {
    id: 'p7',
    name: 'Fiberglass Window Screen',
    category: 'Screens',
    description: 'Insect screen mesh, charcoal, sold per panel.',
    basePrice: 140,
    stockQty: 22,
    lowStockThreshold: 10,
    images: [img(7)],
    keywords: ['screen', 'mesh', 'window', 'insect', 'fiberglass'],
    visibleInShop: true,
    availableForReservation: true,
  },
  {
    id: 'p8',
    name: 'Aluminum Mosquito Screen Frame',
    category: 'Screens',
    description: 'Pre-cut screen frame kit with corner connectors.',
    basePrice: 210,
    stockQty: 4,
    lowStockThreshold: 6,
    images: [img(8)],
    keywords: ['screen', 'frame', 'aluminum', 'window', 'mosquito'],
    visibleInShop: false,
    availableForReservation: true,
  },
];

// ----------------------------------------------------------------------

function makeItem(product: Product, width: number, height: number, qty: number) {
  const { base, surface, perimeter, unit } = computeUnitPrice({
    base: product.basePrice,
    width,
    height,
  });
  return {
    productId: product.id,
    name: product.name,
    image: product.images[0],
    width,
    height,
    qty,
    basePrice: base,
    unitPrice: unit,
    lineTotal: Math.round(unit * qty * 100) / 100,
    _breakdown: { surface, perimeter },
  };
}

function buildOrder(
  partial: Omit<Order, 'items' | 'estTotal'> & {
    lines: { product: Product; width: number; height: number; qty: number }[];
  }
): Order {
  const { lines, ...rest } = partial;
  const items = lines.map((l) => makeItem(l.product, l.width, l.height, l.qty));
  const estTotal = Math.round(items.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;
  return { ...rest, items, estTotal };
}

const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;

export const ORDERS: Order[] = [
  buildOrder({
    id: 'o1',
    code: '#DFB-1042',
    customerName: 'Marites Santos',
    customerMobile: '0917 555 0142',
    customerEmail: 'marites.santos@gmail.com',
    type: 'order',
    fulfilment: 'pickup',
    notes: 'Please call before cutting, will confirm final size.',
    status: 'new',
    createdAt: '2026-06-11T08:30:00Z',
    lines: [
      { product: byId('p1'), width: 36, height: 48, qty: 2 },
      { product: byId('p5'), width: 4, height: 4, qty: 2 },
    ],
  }),
  buildOrder({
    id: 'o2',
    code: '#DFB-1041',
    customerName: 'Jun Dela Cruz',
    customerMobile: '0918 222 7781',
    customerEmail: 'jun.delacruz@yahoo.com',
    type: 'order',
    fulfilment: 'delivery',
    address: '12 Rizal St., Brgy. San Andres, Cainta, Rizal',
    status: 'pending',
    createdAt: '2026-06-10T14:10:00Z',
    lines: [{ product: byId('p3'), width: 60, height: 24, qty: 4 }],
  }),
  buildOrder({
    id: 'o3',
    code: '#DFB-1040',
    customerName: 'Aileen Reyes',
    customerMobile: '0920 998 1234',
    customerEmail: 'aileen.reyes@gmail.com',
    type: 'reservation',
    fulfilment: 'pickup',
    notes: 'Reserving for next week installation.',
    status: 'confirmed',
    confirmedAmount: 5200,
    createdAt: '2026-06-09T10:00:00Z',
    lines: [{ product: byId('p7'), width: 30, height: 40, qty: 3 }],
  }),
  buildOrder({
    id: 'o4',
    code: '#DFB-1039',
    customerName: 'Ramil Aquino',
    customerMobile: '0921 445 6620',
    customerEmail: 'ramil.aquino@gmail.com',
    type: 'order',
    fulfilment: 'pickup',
    status: 'ready',
    confirmedAmount: 3850,
    createdAt: '2026-06-08T09:20:00Z',
    lines: [{ product: byId('p2'), width: 24, height: 36, qty: 2 }],
  }),
  buildOrder({
    id: 'o5',
    code: '#DFB-1038',
    customerName: 'Grace Lim',
    customerMobile: '0917 100 2030',
    customerEmail: 'grace.lim@gmail.com',
    type: 'order',
    fulfilment: 'delivery',
    address: '88 Ortigas Ext., Cainta, Rizal',
    status: 'completed',
    confirmedAmount: 7400,
    createdAt: '2026-06-05T16:45:00Z',
    lines: [
      { product: byId('p6'), width: 6, height: 8, qty: 4 },
      { product: byId('p3'), width: 48, height: 24, qty: 2 },
    ],
  }),
  buildOrder({
    id: 'o6',
    code: '#DFB-1037',
    customerName: 'Noel Bautista',
    customerMobile: '0908 776 5541',
    customerEmail: 'noel.bautista@gmail.com',
    type: 'order',
    fulfilment: 'pickup',
    status: 'cancelled',
    staffNote: 'Customer found stock elsewhere.',
    createdAt: '2026-06-04T11:05:00Z',
    lines: [{ product: byId('p1'), width: 24, height: 24, qty: 1 }],
  }),
  buildOrder({
    id: 'o7',
    code: '#DFB-1036',
    customerName: 'Divina Cruz',
    customerMobile: '0915 332 9087',
    customerEmail: 'divina.cruz@gmail.com',
    type: 'reservation',
    fulfilment: 'pickup',
    status: 'pending',
    createdAt: '2026-06-11T07:15:00Z',
    lines: [{ product: byId('p8'), width: 30, height: 36, qty: 2 }],
  }),
  // Orders belonging to the signed-in buyer (see CURRENT_BUYER).
  buildOrder({
    id: 'o8',
    code: '#DFB-1031',
    customerName: 'Marites Santos',
    customerMobile: '0917 555 0142',
    customerEmail: 'marites.santos@gmail.com',
    type: 'order',
    fulfilment: 'pickup',
    status: 'confirmed',
    confirmedAmount: 4200,
    createdAt: '2026-06-07T09:40:00Z',
    lines: [{ product: byId('p6'), width: 6, height: 8, qty: 2 }],
  }),
  buildOrder({
    id: 'o9',
    code: '#DFB-1025',
    customerName: 'Marites Santos',
    customerMobile: '0917 555 0142',
    customerEmail: 'marites.santos@gmail.com',
    type: 'reservation',
    fulfilment: 'pickup',
    status: 'confirmed',
    notes: 'Holding these for our renovation next week.',
    createdAt: '2026-06-06T13:20:00Z',
    lines: [{ product: byId('p7'), width: 30, height: 40, qty: 2 }],
  }),
  buildOrder({
    id: 'o10',
    code: '#DFB-1009',
    customerName: 'Marites Santos',
    customerMobile: '0917 555 0142',
    customerEmail: 'marites.santos@gmail.com',
    type: 'order',
    fulfilment: 'delivery',
    address: '24 Mabini St., Brgy. San Isidro, Cainta, Rizal',
    status: 'completed',
    confirmedAmount: 6800,
    createdAt: '2026-05-28T10:15:00Z',
    lines: [{ product: byId('p1'), width: 36, height: 48, qty: 2 }],
  }),
];

// ----------------------------------------------------------------------

export const BANNERS: Banner[] = [
  {
    id: 'b1',
    image: '/assets/images/cover/cover-1.webp',
    caption: 'Rainy season sale — 10% off all window screens',
    link: 'Screens',
    status: 'active',
    order: 1,
  },
  {
    id: 'b2',
    image: '/assets/images/cover/cover-2.webp',
    caption: 'New tinted glass arrivals now in stock',
    link: 'p2',
    status: 'active',
    order: 2,
  },
  {
    id: 'b3',
    image: '/assets/images/cover/cover-3.webp',
    caption: 'Fiesta promo — free measurement service',
    status: 'scheduled',
    order: 3,
  },
  {
    id: 'b4',
    image: '/assets/images/cover/cover-4.webp',
    caption: 'Old Christmas banner',
    status: 'inactive',
    order: 4,
  },
];

// ----------------------------------------------------------------------

export const RECOMMENDATIONS: Recommendation[] = [
  { productId: 'p1', addonIds: ['p5', 'p3'] },
  { productId: 'p3', addonIds: ['p5', 'p6'] },
  { productId: 'p7', addonIds: ['p8'] },
];

// ----------------------------------------------------------------------

export const SHOP_SETTINGS: ShopSettings = {
  name: 'DFB Smart Shop',
  address: 'Felix Y. Manalo St., San Isidro, Cainta, Rizal',
  contact: '0917 555 0100',
  hours: 'Mon–Sat, 8:00 AM – 6:00 PM',
  surfaceMultiplier: 1.5,
  perimeterMultiplier: 2,
  lowStockThreshold: 10,
  staff: [
    { id: 's1', name: 'Danilo F. Bautista', email: 'owner@dfbsmartshop.com', role: 'Owner' },
    { id: 's2', name: 'Rosa Mendoza', email: 'rosa@dfbsmartshop.com', role: 'Staff' },
  ],
};

export const OWNER_NAME = 'Danilo Bautista';

// ----------------------------------------------------------------------
// Order placement — store checkout pushes new orders here so the admin
// Orders list and detail can retrieve them (stand-in for a Firebase write).
// ----------------------------------------------------------------------

export function generateOrderCode(): string {
  return `#DFB-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function addOrder(order: Order): void {
  ORDERS.unshift(order);
}

// ----------------------------------------------------------------------
// Buyer (client) side — the signed-in customer, their notifications, and
// helpers to read their orders out of the shared ORDERS list.
// ----------------------------------------------------------------------

export type Buyer = {
  id: string;
  fullName: string;
  firstName: string;
  mobile: string;
  email: string;
  address: string;
  preference: 'pickup' | 'delivery';
};

export const CURRENT_BUYER: Buyer = {
  id: 'buyer1',
  fullName: 'Marites Santos',
  firstName: 'Marites',
  mobile: '0917 555 0142',
  email: 'marites.santos@gmail.com',
  address: '24 Mabini St., Brgy. San Isidro, Cainta, Rizal',
  preference: 'pickup',
};

export function getBuyerOrders(email: string = CURRENT_BUYER.email): Order[] {
  return ORDERS.filter((o) => o.customerEmail === email).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export type BuyerNotification = {
  id: string;
  text: string;
  createdAt: string;
  read: boolean;
  type: 'order' | 'promo';
};

export const BUYER_NOTIFICATIONS: BuyerNotification[] = [
  {
    id: 'n1',
    text: 'Your order #DFB-1042 was confirmed by the shop.',
    createdAt: '2026-06-11T09:05:00Z',
    read: false,
    type: 'order',
  },
  {
    id: 'n2',
    text: 'Order #DFB-1031 is ready for pickup.',
    createdAt: '2026-06-10T15:30:00Z',
    read: false,
    type: 'order',
  },
  {
    id: 'n3',
    text: 'New promo: 10% off aluminum frames this week.',
    createdAt: '2026-06-09T08:00:00Z',
    read: true,
    type: 'promo',
  },
];
