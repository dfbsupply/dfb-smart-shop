import type {
  Order,
  Banner,
  Product,
  OrderItem,
  ShopSettings,
} from 'src/data/types';
import type {
  Order as DbOrder,
  Promo as DbPromo,
  Branch as DbBranch,
  Product as DbProduct,
  Settings as DbSettings,
  OrderItem as DbOrderItem,
} from 'src/lib/database.types';

// ----------------------------------------------------------------------
// Row mappers — translate Supabase rows (snake_case) into the camelCase
// domain types the UI already speaks, so views barely change when the data
// source flips from mock to live.
// ----------------------------------------------------------------------

export function mapProduct(db: DbProduct): Product {
  return {
    id: db.id,
    name: db.name,
    category: db.category,
    description: db.description,
    dimensions: db.dimensions ?? undefined,
    basePrice: db.base_price,
    stockQty: db.stock_qty,
    lowStockThreshold: db.low_stock_threshold,
    images: db.images ?? [],
    keywords: db.keywords ?? [],
    visibleInShop: db.visible_in_shop,
    availableForReservation: db.available_for_reservation,
  };
}

export function mapOrderItem(db: DbOrderItem): OrderItem {
  return {
    productId: db.product_id ?? '',
    name: db.name,
    image: db.image ?? '',
    width: db.width,
    height: db.height,
    qty: db.qty,
    basePrice: db.base_price,
    unitPrice: db.unit_price,
    lineTotal: db.line_total,
    source: db.source,
    referencePhoto: db.reference_photo ?? undefined,
  };
}

export function mapOrder(db: DbOrder & { order_items?: DbOrderItem[] }): Order {
  const items = (db.order_items ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapOrderItem);

  return {
    id: db.id,
    code: db.code,
    customerName: db.customer_name,
    customerMobile: db.customer_mobile,
    customerEmail: db.customer_email ?? '',
    type: db.type,
    fulfilment: db.fulfilment,
    address: db.address ?? undefined,
    notes: db.notes ?? undefined,
    items,
    estTotal: db.est_total,
    confirmedAmount: db.confirmed_amount ?? undefined,
    status: db.status,
    staffNote: db.staff_note ?? undefined,
    source: db.source,
    createdAt: db.created_at,
  };
}

export function mapPromo(db: DbPromo): Banner {
  return {
    id: db.id,
    image: db.image,
    caption: db.caption,
    link: db.link ?? undefined,
    status: db.status,
    order: db.sort_order,
  };
}

// Settings + the main branch together fill the UI ShopSettings shape.
// Staff accounts live in the admin-only `admins` table (not client-readable),
// so they are left to the caller to supply if needed.
export function mapSettings(db: DbSettings, mainBranch?: DbBranch): ShopSettings {
  const contactParts = [mainBranch?.telephone, mainBranch?.mobile].filter(Boolean);
  return {
    name: db.shop_name,
    address: mainBranch?.address ?? '',
    contact: contactParts.join(' · '),
    hours: db.store_hours ?? '',
    surfaceMultiplier: db.surface_multiplier,
    perimeterMultiplier: db.perimeter_multiplier,
    lowStockThreshold: db.low_stock_threshold,
    staff: [],
  };
}
