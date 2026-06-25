// ----------------------------------------------------------------------
// Supabase database types for the `public` schema.
//
// Hand-written to match supabase/apply_all.sql (Phase 1). When the schema
// changes, regenerate with:
//   supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
// ----------------------------------------------------------------------

export type ProductCategory = 'Glass' | 'Aluminum Profiles' | 'Hardware & Accessories' | 'Screens';
export type OrderStatus = 'new' | 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
export type OrderType = 'order' | 'reservation';
export type Fulfilment = 'pickup' | 'delivery';
export type OrderSource = 'manual' | 'visual_search';
export type BannerStatus = 'active' | 'scheduled' | 'inactive';
export type NotificationType = 'order' | 'promo';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  dimensions: string | null;
  base_price: number;
  stock_qty: number;
  low_stock_threshold: number;
  images: string[];
  keywords: string[];
  visible_in_shop: boolean;
  available_for_reservation: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  code: string;
  customer_id: string | null;
  customer_name: string;
  customer_mobile: string;
  customer_email: string | null;
  type: OrderType;
  fulfilment: Fulfilment;
  address: string | null;
  notes: string | null;
  staff_note: string | null;
  est_total: number;
  confirmed_amount: number | null;
  status: OrderStatus;
  source: OrderSource;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  image: string | null;
  width: number;
  height: number;
  qty: number;
  base_price: number;
  unit_price: number;
  line_total: number;
  source: OrderSource;
  reference_photo: string | null;
  sort_order: number;
}

export interface Promo {
  id: string;
  image: string;
  caption: string;
  link: string | null;
  status: BannerStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  product_id: string;
  addon_id: string;
  sort_order: number;
}

export interface Settings {
  id: number;
  shop_name: string;
  proprietor: string | null;
  email: string | null;
  store_hours: string | null;
  surface_multiplier: number;
  perimeter_multiplier: number;
  low_stock_threshold: number;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  telephone: string | null;
  mobile: string | null;
  is_main: boolean;
  sort_order: number;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  mobile: string | null;
  email: string | null;
  preference: Fulfilment | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  text: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export interface Admin {
  user_id: string;
  label: string | null;
  created_at: string;
}
