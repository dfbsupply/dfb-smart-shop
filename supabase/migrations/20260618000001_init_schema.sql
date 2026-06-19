-- ============================================================================
-- DFB Smart Shop — Phase 1: initial schema
-- Translates database/schema.md (originally Firebase Realtime DB) into a
-- relational PostgreSQL schema for Supabase. Tables, enums, helper functions,
-- and triggers only. RLS policies live in 20260618000002_rls.sql; seed data in
-- supabase/seed.sql.
-- ============================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- Enums (values mirror frontend/src/data/types.ts exactly)
-- ----------------------------------------------------------------------------
create type product_category as enum (
  'Glass', 'Aluminum Profiles', 'Hardware & Accessories', 'Screens'
);
create type order_status   as enum ('new','pending','confirmed','ready','completed','cancelled');
create type order_type      as enum ('order','reservation');
create type fulfilment      as enum ('pickup','delivery');
create type order_source    as enum ('manual','visual_search');
create type banner_status   as enum ('active','scheduled','inactive');
create type notification_type as enum ('order','promo');

-- ----------------------------------------------------------------------------
-- Helper functions
-- ----------------------------------------------------------------------------

-- Generic updated_at maintenance.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Dynamic price (Objective 3). Mirrors frontend/src/data/pricing.ts:
--   unit = base + (W*H*surfaceMult) + (2*(W+H)*perimeterMult)
-- Defaults match Settings (surface 1.5, perimeter 2).
create or replace function public.compute_unit_price(
  base numeric, w numeric, h numeric,
  surface_mult numeric default 1.5, perimeter_mult numeric default 2
) returns numeric language sql immutable as $$
  select round(base + (w * h * surface_mult) + (2 * (w + h) * perimeter_mult), 2);
$$;

-- ----------------------------------------------------------------------------
-- admins  (mirrors schema.md `admins/<uid>: true` — the write-gate for staff)
-- Rows are managed by the service role / SQL only (no client write policy).
-- ----------------------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  label      text,                 -- e.g. 'Owner', 'Staff'
  created_at timestamptz not null default now()
);

-- is_admin(): SECURITY DEFINER so RLS policies can call it without recursion.
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.user_id = uid);
$$;

-- ----------------------------------------------------------------------------
-- profiles  (buyer accounts — schema.md `users/<uid>`)
-- One row per auth user, created automatically on sign-up.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  mobile      text,
  email       text,
  preference  fulfilment default 'pickup',
  address     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- products  (inventory — Admin A-5/A-6)
-- ----------------------------------------------------------------------------
create table public.products (
  id                        uuid primary key default gen_random_uuid(),
  name                      text not null,
  category                  product_category not null,
  description               text not null default '',
  base_price                numeric(12,2) not null check (base_price >= 0), -- P_base
  stock_qty                 integer not null default 0 check (stock_qty >= 0),
  low_stock_threshold       integer not null default 10 check (low_stock_threshold >= 0),
  images                    text[] not null default '{}',  -- high-res photo URLs
  keywords                  text[] not null default '{}',  -- visual-search bridge tags
  visible_in_shop           boolean not null default true,
  available_for_reservation boolean not null default true,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
create index products_category_idx on public.products (category);
create index products_visible_idx  on public.products (visible_in_shop);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- promos  (promo banners — Admin A-7 → Webshop W-1)
-- ----------------------------------------------------------------------------
create table public.promos (
  id          uuid primary key default gen_random_uuid(),
  image       text not null,
  caption     text not null default '',
  link        text,                       -- product id or category (optional)
  status      banner_status not null default 'inactive',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger promos_updated_at before update on public.promos
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- recommendations  (admin-curated "frequently bought together" — A-8)
-- Join table: each row = one add-on suggested for a product.
-- ----------------------------------------------------------------------------
create table public.recommendations (
  product_id  uuid not null references public.products(id) on delete cascade,
  addon_id    uuid not null references public.products(id) on delete cascade,
  sort_order  integer not null default 0,
  primary key (product_id, addon_id),
  check (product_id <> addon_id)
);
create index recommendations_addon_idx on public.recommendations (addon_id);

-- ----------------------------------------------------------------------------
-- settings  (singleton shop profile + pricing constants — Admin A-10)
-- ----------------------------------------------------------------------------
create table public.settings (
  id                  integer primary key default 1 check (id = 1),
  shop_name           text not null,
  proprietor          text,
  email               text,
  store_hours         text,
  surface_multiplier  numeric(6,2) not null default 1.5,
  perimeter_multiplier numeric(6,2) not null default 2,
  low_stock_threshold integer not null default 10,
  updated_at          timestamptz not null default now()
);
create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- branches  (physical locations — real business has Main + a branch)
-- ----------------------------------------------------------------------------
create table public.branches (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,            -- 'Main', 'Branch'
  address     text not null,
  telephone   text,
  mobile      text,
  is_main     boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- orders  (orders & reservations — Admin A-3/A-4, Buyer B-4/B-5, Webshop W-6)
-- customer_id is NULL for guest checkouts (Webshop allows ordering without an
-- account); set to the buyer's uid when they are signed in.
-- ----------------------------------------------------------------------------
create sequence if not exists dfb_order_code_seq start 1043;  -- seeded codes end at 1042
create or replace function public.next_order_code()
returns text language sql as $$
  select '#DFB-' || nextval('dfb_order_code_seq')::text;
$$;

create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  code             text unique not null default public.next_order_code(),
  customer_id      uuid references public.profiles(id) on delete set null,
  customer_name    text not null,
  customer_mobile  text not null,
  customer_email   text,
  type             order_type not null default 'order',
  fulfilment       fulfilment not null default 'pickup',
  address          text,
  notes            text,
  staff_note       text,                 -- internal, not shown to customer
  est_total        numeric(12,2) not null default 0,
  confirmed_amount numeric(12,2),
  status           order_status not null default 'new',
  source           order_source not null default 'manual',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index orders_customer_idx on public.orders (customer_id);
create index orders_status_idx   on public.orders (status);
create index orders_created_idx  on public.orders (created_at desc);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- order_items  (denormalized line items — pricing frozen at write time)
-- ----------------------------------------------------------------------------
create table public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      uuid references public.products(id) on delete set null,
  name            text not null,        -- snapshot of product name
  image           text,                 -- snapshot of product image
  width           numeric(10,2) not null,  -- inches
  height          numeric(10,2) not null,  -- inches
  qty             integer not null check (qty > 0),
  base_price      numeric(12,2) not null,
  unit_price      numeric(12,2) not null,  -- computed via the dynamic formula
  line_total      numeric(12,2) not null,
  source          order_source not null default 'manual',
  reference_photo text,                  -- customer's uploaded photo (optional)
  sort_order      integer not null default 0
);
create index order_items_order_idx on public.order_items (order_id);

-- ----------------------------------------------------------------------------
-- notifications  (per-buyer in-app alerts — Buyer B-8)
-- ----------------------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  text        text not null,
  type        notification_type not null default 'order',
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, read);
