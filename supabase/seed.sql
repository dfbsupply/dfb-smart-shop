-- ============================================================================
-- DFB Smart Shop — Phase 1 seed data
-- Catalogue + shop profile that do NOT depend on auth users. Uses the real
-- business details (DFB Glass and Aluminum Supply, proprietress Lorie Bandong,
-- Pasig main + Cainta branch). Demo orders are seeded as guest orders
-- (customer_id NULL); buyer/admin accounts, profile links, and notifications
-- are added in Phase 2 once auth users exist. Fixed UUIDs are used so demo rows
-- can reference each other; production rows use gen_random_uuid().
-- Idempotent: safe to re-run (uses upserts / delete-then-insert for demo rows).
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Shop profile (singleton) + branches — REAL business data
-- ---------------------------------------------------------------------------
insert into public.settings (id, shop_name, proprietor, email, store_hours,
                             surface_multiplier, perimeter_multiplier, low_stock_threshold)
values (1, 'DFB Glass and Aluminum Supply', 'Lorie Bandong',
        'dfbglassandaluminumsupply@gmail.com', 'Mon–Sat, 8:00 AM – 6:00 PM',
        1.5, 2, 10)
on conflict (id) do update set
  shop_name = excluded.shop_name,
  proprietor = excluded.proprietor,
  email = excluded.email,
  store_hours = excluded.store_hours,
  surface_multiplier = excluded.surface_multiplier,
  perimeter_multiplier = excluded.perimeter_multiplier,
  low_stock_threshold = excluded.low_stock_threshold;

delete from public.branches;
insert into public.branches (name, address, telephone, mobile, is_main, sort_order) values
  ('Main',
   'B5 L4 P. Gomez St., Reyes Comp., Brgy. Manggahan, Pasig City',
   '(02) 8682-08-74 / (02) 8697-18-86', '0942-016-1332', true, 1),
  ('Branch',
   'L6 Bl Uni B-A, Greenheights Executive Homes Phase 3 (Along F. Manalo St.), San Isidro, Cainta, Rizal',
   '(02) 8668-73-62', null, false, 2);

-- ---------------------------------------------------------------------------
-- Products  (ported from frontend/src/data/mock.ts)
-- ---------------------------------------------------------------------------
delete from public.products where id in (
  '11111111-1111-1111-1111-000000000001','11111111-1111-1111-1111-000000000002',
  '11111111-1111-1111-1111-000000000003','11111111-1111-1111-1111-000000000004',
  '11111111-1111-1111-1111-000000000005','11111111-1111-1111-1111-000000000006',
  '11111111-1111-1111-1111-000000000007','11111111-1111-1111-1111-000000000008');

insert into public.products
  (id, name, category, description, base_price, stock_qty, low_stock_threshold, images, keywords, visible_in_shop, available_for_reservation)
values
  ('11111111-1111-1111-1111-000000000001','Clear Float Glass 5mm','Glass',
   'Standard clear float glass, ideal for windows and table tops.',320,48,10,
   '{/assets/images/product/product-1.webp}','{glass,window,clear,sheet}',true,true),
  ('11111111-1111-1111-1111-000000000002','Tinted Bronze Glass 6mm','Glass',
   'Heat-reducing tinted glass for façades and partitions.',480,6,8,
   '{/assets/images/product/product-2.webp}','{glass,tinted,bronze,window}',true,true),
  ('11111111-1111-1111-1111-000000000003','Aluminum Sliding Profile','Aluminum Profiles',
   'Powder-coated sliding track profile for windows and doors.',250,120,20,
   '{/assets/images/product/product-3.webp}','{aluminum,profile,frame,metal,track}',true,true),
  ('11111111-1111-1111-1111-000000000004','Aluminum Casement Profile','Aluminum Profiles',
   'Durable casement window profile, mill finish.',270,0,15,
   '{/assets/images/product/product-4.webp}','{aluminum,profile,frame,casement,metal}',true,false),
  ('11111111-1111-1111-1111-000000000005','Window Lock Set','Hardware & Accessories',
   'Crescent lock set for sliding windows.',95,7,12,
   '{/assets/images/product/product-5.webp}','{lock,hardware,window,accessory}',true,false),
  ('11111111-1111-1111-1111-000000000006','Stainless Door Handle','Hardware & Accessories',
   'Brushed stainless handle for aluminum doors.',180,35,10,
   '{/assets/images/product/product-6.webp}','{handle,hardware,door,stainless}',true,false),
  ('11111111-1111-1111-1111-000000000007','Fiberglass Window Screen','Screens',
   'Insect screen mesh, charcoal, sold per panel.',140,22,10,
   '{/assets/images/product/product-7.webp}','{screen,mesh,window,insect,fiberglass}',true,true),
  ('11111111-1111-1111-1111-000000000008','Aluminum Mosquito Screen Frame','Screens',
   'Pre-cut screen frame kit with corner connectors.',210,4,6,
   '{/assets/images/product/product-8.webp}','{screen,frame,aluminum,window,mosquito}',false,true);

-- ---------------------------------------------------------------------------
-- Recommendations (frequently bought together — A-8)
-- ---------------------------------------------------------------------------
delete from public.recommendations;
insert into public.recommendations (product_id, addon_id, sort_order) values
  ('11111111-1111-1111-1111-000000000001','11111111-1111-1111-1111-000000000005',0),
  ('11111111-1111-1111-1111-000000000001','11111111-1111-1111-1111-000000000003',1),
  ('11111111-1111-1111-1111-000000000003','11111111-1111-1111-1111-000000000005',0),
  ('11111111-1111-1111-1111-000000000003','11111111-1111-1111-1111-000000000006',1),
  ('11111111-1111-1111-1111-000000000007','11111111-1111-1111-1111-000000000008',0);

-- ---------------------------------------------------------------------------
-- Promo banners (A-7 → W-1)
-- ---------------------------------------------------------------------------
delete from public.promos where id in (
  '33333333-3333-3333-3333-000000000001','33333333-3333-3333-3333-000000000002',
  '33333333-3333-3333-3333-000000000003','33333333-3333-3333-3333-000000000004');
insert into public.promos (id, image, caption, link, status, sort_order) values
  ('33333333-3333-3333-3333-000000000001','/assets/images/cover/cover-1.webp',
   'Rainy season sale — 10% off all window screens','Screens','active',1),
  ('33333333-3333-3333-3333-000000000002','/assets/images/cover/cover-2.webp',
   'New tinted glass arrivals now in stock','11111111-1111-1111-1111-000000000002','active',2),
  ('33333333-3333-3333-3333-000000000003','/assets/images/cover/cover-3.webp',
   'Fiesta promo — free measurement service',null,'scheduled',3),
  ('33333333-3333-3333-3333-000000000004','/assets/images/cover/cover-4.webp',
   'Old Christmas banner',null,'inactive',4);

-- ---------------------------------------------------------------------------
-- Demo orders (guest orders: customer_id NULL). Phase 2 links the four
-- "Marites Santos" orders (1042, 1031, 1025, 1009) to her buyer account.
-- ---------------------------------------------------------------------------
delete from public.orders where code in
  ('#DFB-1042','#DFB-1041','#DFB-1040','#DFB-1039','#DFB-1038',
   '#DFB-1037','#DFB-1036','#DFB-1031','#DFB-1025','#DFB-1009');

insert into public.orders
  (id, code, customer_name, customer_mobile, customer_email, type, fulfilment,
   address, notes, staff_note, confirmed_amount, status, created_at)
values
  ('22222222-2222-2222-2222-000000000001','#DFB-1042','Marites Santos','0917 555 0142','marites.santos@gmail.com','order','pickup',
   null,'Please call before cutting, will confirm final size.',null,null,'new','2026-06-11T08:30:00Z'),
  ('22222222-2222-2222-2222-000000000002','#DFB-1041','Jun Dela Cruz','0918 222 7781','jun.delacruz@yahoo.com','order','delivery',
   '12 Rizal St., Brgy. San Andres, Cainta, Rizal',null,null,null,'pending','2026-06-10T14:10:00Z'),
  ('22222222-2222-2222-2222-000000000003','#DFB-1040','Aileen Reyes','0920 998 1234','aileen.reyes@gmail.com','reservation','pickup',
   null,'Reserving for next week installation.',null,5200,'confirmed','2026-06-09T10:00:00Z'),
  ('22222222-2222-2222-2222-000000000004','#DFB-1039','Ramil Aquino','0921 445 6620','ramil.aquino@gmail.com','order','pickup',
   null,null,null,3850,'ready','2026-06-08T09:20:00Z'),
  ('22222222-2222-2222-2222-000000000005','#DFB-1038','Grace Lim','0917 100 2030','grace.lim@gmail.com','order','delivery',
   '88 Ortigas Ext., Cainta, Rizal',null,null,7400,'completed','2026-06-05T16:45:00Z'),
  ('22222222-2222-2222-2222-000000000006','#DFB-1037','Noel Bautista','0908 776 5541','noel.bautista@gmail.com','order','pickup',
   null,null,'Customer found stock elsewhere.',null,'cancelled','2026-06-04T11:05:00Z'),
  ('22222222-2222-2222-2222-000000000007','#DFB-1036','Divina Cruz','0915 332 9087','divina.cruz@gmail.com','reservation','pickup',
   null,null,null,null,'pending','2026-06-11T07:15:00Z'),
  ('22222222-2222-2222-2222-000000000008','#DFB-1031','Marites Santos','0917 555 0142','marites.santos@gmail.com','order','pickup',
   null,null,null,4200,'confirmed','2026-06-07T09:40:00Z'),
  ('22222222-2222-2222-2222-000000000009','#DFB-1025','Marites Santos','0917 555 0142','marites.santos@gmail.com','reservation','pickup',
   null,'Holding these for our renovation next week.',null,null,'confirmed','2026-06-06T13:20:00Z'),
  ('22222222-2222-2222-2222-000000000010','#DFB-1009','Marites Santos','0917 555 0142','marites.santos@gmail.com','order','delivery',
   '24 Mabini St., Brgy. San Isidro, Cainta, Rizal',null,null,6800,'completed','2026-05-28T10:15:00Z');

-- Line items — unit_price/line_total computed via the dynamic pricing function.
delete from public.order_items where order_id in (
  select id from public.orders where code in
    ('#DFB-1042','#DFB-1041','#DFB-1040','#DFB-1039','#DFB-1038',
     '#DFB-1037','#DFB-1036','#DFB-1031','#DFB-1025','#DFB-1009'));

insert into public.order_items (order_id, product_id, name, image, width, height, qty, base_price, unit_price, line_total, sort_order)
select v.order_id, p.id, p.name, p.images[1], v.w, v.h, v.qty, p.base_price,
       public.compute_unit_price(p.base_price, v.w, v.h),
       round(public.compute_unit_price(p.base_price, v.w, v.h) * v.qty, 2), v.sort_order
from (values
  -- order_id, product_id, w, h, qty, sort
  ('22222222-2222-2222-2222-000000000001'::uuid,'11111111-1111-1111-1111-000000000001'::uuid,36,48,2,0),
  ('22222222-2222-2222-2222-000000000001'::uuid,'11111111-1111-1111-1111-000000000005'::uuid,4,4,2,1),
  ('22222222-2222-2222-2222-000000000002'::uuid,'11111111-1111-1111-1111-000000000003'::uuid,60,24,4,0),
  ('22222222-2222-2222-2222-000000000003'::uuid,'11111111-1111-1111-1111-000000000007'::uuid,30,40,3,0),
  ('22222222-2222-2222-2222-000000000004'::uuid,'11111111-1111-1111-1111-000000000002'::uuid,24,36,2,0),
  ('22222222-2222-2222-2222-000000000005'::uuid,'11111111-1111-1111-1111-000000000006'::uuid,6,8,4,0),
  ('22222222-2222-2222-2222-000000000005'::uuid,'11111111-1111-1111-1111-000000000003'::uuid,48,24,2,1),
  ('22222222-2222-2222-2222-000000000006'::uuid,'11111111-1111-1111-1111-000000000001'::uuid,24,24,1,0),
  ('22222222-2222-2222-2222-000000000007'::uuid,'11111111-1111-1111-1111-000000000008'::uuid,30,36,2,0),
  ('22222222-2222-2222-2222-000000000008'::uuid,'11111111-1111-1111-1111-000000000006'::uuid,6,8,2,0),
  ('22222222-2222-2222-2222-000000000009'::uuid,'11111111-1111-1111-1111-000000000007'::uuid,30,40,2,0),
  ('22222222-2222-2222-2222-000000000010'::uuid,'11111111-1111-1111-1111-000000000001'::uuid,36,48,2,0)
) as v(order_id, product_id, w, h, qty, sort_order)
join public.products p on p.id = v.product_id;

-- Roll up estimated totals from the seeded line items.
update public.orders o
set est_total = coalesce((select sum(i.line_total) from public.order_items i where i.order_id = o.id), 0)
where o.code in
  ('#DFB-1042','#DFB-1041','#DFB-1040','#DFB-1039','#DFB-1038',
   '#DFB-1037','#DFB-1036','#DFB-1031','#DFB-1025','#DFB-1009');

commit;
