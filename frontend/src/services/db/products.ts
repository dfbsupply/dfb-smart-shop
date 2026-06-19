import type { Product, ProductCategory } from 'src/data/types';

import { supabase } from 'src/lib/supabase';

import { mapProduct } from './mappers';

// ----------------------------------------------------------------------
// Products data access (Admin A-5/A-6). Reads are public under RLS; writes
// require an admin session (enforced server-side by the products_admin_write
// policy).
// ----------------------------------------------------------------------

export type ProductInput = {
  name: string;
  category: ProductCategory;
  description: string;
  basePrice: number;
  stockQty: number;
  lowStockThreshold: number;
  images: string[];
  keywords: string[];
  visibleInShop: boolean;
  availableForReservation: boolean;
};

function toRow(input: ProductInput) {
  return {
    name: input.name,
    category: input.category,
    description: input.description,
    base_price: input.basePrice,
    stock_qty: input.stockQty,
    low_stock_threshold: input.lowStockThreshold,
    images: input.images,
    keywords: input.keywords,
    visible_in_shop: input.visibleInShop,
    available_for_reservation: input.availableForReservation,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    // created_at can tie (seeded in one statement), so add a stable tiebreak.
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

// Storefront catalogue — only shop-visible products, regardless of who is
// signed in (an admin browsing the shop should still see the public view).
export async function fetchVisibleProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('visible_in_shop', true)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data, error } = await supabase.from('products').insert(toRow(input)).select('*').single();
  if (error) throw error;
  return mapProduct(data);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(toRow(input))
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function setProductVisibility(id: string, visible: boolean): Promise<void> {
  const { error } = await supabase.from('products').update({ visible_in_shop: visible }).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}
