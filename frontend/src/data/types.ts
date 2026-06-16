// ----------------------------------------------------------------------
// DFB Smart Shop — Admin domain types
// Mirrors the Firebase Realtime Database shape (products, orders, promoList,
// recommendations, settings) so the mock layer can be swapped for live data.
// ----------------------------------------------------------------------

export type ProductCategory =
  | 'Glass'
  | 'Aluminum Profiles'
  | 'Hardware & Accessories'
  | 'Screens';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Glass',
  'Aluminum Profiles',
  'Hardware & Accessories',
  'Screens',
];

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  basePrice: number; // P_base, feeds the price calculator
  stockQty: number;
  lowStockThreshold: number;
  images: string[];
  keywords: string[]; // visual-search tags bridging MobileNet results to the SKU
  visibleInShop: boolean;
  availableForReservation: boolean;
};

// ----------------------------------------------------------------------

export type OrderStatus =
  | 'new'
  | 'pending'
  | 'confirmed'
  | 'ready' // Ready for Pickup
  | 'completed'
  | 'cancelled';

export type OrderType = 'order' | 'reservation';

export type Fulfilment = 'pickup' | 'delivery';

// How an order/line was created: a normal browse, or via the AI visual search.
export type OrderSource = 'manual' | 'visual_search';

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  width: number; // inches
  height: number; // inches
  qty: number;
  basePrice: number;
  unitPrice: number; // computed via the dynamic formula
  lineTotal: number;
  source?: OrderSource;
  referencePhoto?: string; // customer's uploaded/captured photo (data URL)
};

export type Order = {
  id: string;
  code: string; // #DFB-XXXX
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  type: OrderType;
  fulfilment: Fulfilment;
  address?: string;
  notes?: string;
  items: OrderItem[];
  estTotal: number;
  confirmedAmount?: number;
  status: OrderStatus;
  staffNote?: string;
  source?: OrderSource; // 'visual_search' if any line came from a photo match
  createdAt: string; // ISO date
};

// ----------------------------------------------------------------------

export type BannerStatus = 'active' | 'scheduled' | 'inactive';

export type Banner = {
  id: string;
  image: string;
  caption: string;
  link?: string;
  status: BannerStatus;
  order: number;
};

// ----------------------------------------------------------------------

export type Recommendation = {
  productId: string;
  addonIds: string[];
};

// ----------------------------------------------------------------------

export type StaffAccount = {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Staff';
};

export type ShopSettings = {
  name: string;
  address: string;
  contact: string;
  hours: string;
  surfaceMultiplier: number; // default 1.5
  perimeterMultiplier: number; // default 2
  lowStockThreshold: number;
  staff: StaffAccount[];
};
