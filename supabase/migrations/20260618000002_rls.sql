-- ============================================================================
-- DFB Smart Shop — Phase 1: Row-Level Security
-- Mirrors database/database.rules.json. Public can read the catalogue; only
-- admins write it. Buyers see only their own orders / profile / notifications.
-- Guests (anon) may place orders (Webshop checkout requires no account).
-- ============================================================================

alter table public.admins          enable row level security;
alter table public.profiles        enable row level security;
alter table public.products        enable row level security;
alter table public.promos          enable row level security;
alter table public.recommendations enable row level security;
alter table public.settings        enable row level security;
alter table public.branches        enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.notifications   enable row level security;

-- ---------------------------------------------------------------------------
-- admins: no client policies. is_admin() is SECURITY DEFINER so it still works;
-- rows are managed by the service role / SQL only. (RLS on with no policy =
-- deny all client access.)
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- products: public reads visible items; admins read all and write.
-- ---------------------------------------------------------------------------
create policy products_read on public.products
  for select using (visible_in_shop or public.is_admin());
create policy products_admin_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- promos: public reads active banners; admins read all and write.
-- ---------------------------------------------------------------------------
create policy promos_read on public.promos
  for select using (status = 'active' or public.is_admin());
create policy promos_admin_write on public.promos
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- recommendations / settings / branches: public read, admin write.
-- ---------------------------------------------------------------------------
create policy recommendations_read on public.recommendations
  for select using (true);
create policy recommendations_admin_write on public.recommendations
  for all using (public.is_admin()) with check (public.is_admin());

create policy settings_read on public.settings
  for select using (true);
create policy settings_admin_write on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

create policy branches_read on public.branches
  for select using (true);
create policy branches_admin_write on public.branches
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- profiles: a user sees/edits only their own row; admins see all.
-- (No role column here, so self-update cannot escalate privileges.)
-- ---------------------------------------------------------------------------
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_self_insert on public.profiles
  for insert with check (id = auth.uid());
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- orders: buyer sees own; admin sees all. Anyone may create an order for
-- themselves or as a guest. Status/amount updates are admin-only in Phase 1
-- (buyer "cancel while pending" will be added as a SECURITY DEFINER RPC later).
-- ---------------------------------------------------------------------------
create policy orders_read on public.orders
  for select using (public.is_admin() or customer_id = auth.uid());
create policy orders_insert on public.orders
  for insert with check (
    public.is_admin() or customer_id is null or customer_id = auth.uid()
  );
create policy orders_admin_update on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
create policy orders_admin_delete on public.orders
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- order_items: visibility/insert follow the parent order.
-- ---------------------------------------------------------------------------
create policy order_items_read on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (public.is_admin() or o.customer_id = auth.uid())
    )
  );
create policy order_items_insert on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (public.is_admin() or o.customer_id is null or o.customer_id = auth.uid())
    )
  );
create policy order_items_admin_write on public.order_items
  for update using (public.is_admin()) with check (public.is_admin());
create policy order_items_admin_delete on public.order_items
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- notifications: buyer reads own & marks own read; admins create them.
-- ---------------------------------------------------------------------------
create policy notifications_read on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());
create policy notifications_admin_insert on public.notifications
  for insert with check (public.is_admin());
create policy notifications_owner_update on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_owner_delete on public.notifications
  for delete using (user_id = auth.uid() or public.is_admin());
