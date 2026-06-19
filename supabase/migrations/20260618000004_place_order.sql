-- ============================================================================
-- DFB Smart Shop — place_order RPC (Phase 5, Webshop checkout W-6)
-- Atomically inserts an order + its line items and returns the generated
-- #DFB-#### code. SECURITY DEFINER so a guest checkout (customer_id NULL) can
-- receive the new code — a guest's RLS SELECT policy would otherwise block
-- reading back their own just-inserted row.
--
-- The order is attributed to the caller (auth.uid()) when signed in, or left
-- as a guest order (NULL) otherwise. est_total/unit prices are taken from the
-- client as an estimate; the shop confirms the final amount offline.
-- ============================================================================

create or replace function public.place_order(payload jsonb)
returns table (id uuid, code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_code     text;
  v_item     jsonb;
begin
  if coalesce(trim(payload->>'customer_name'), '') = ''
     or coalesce(trim(payload->>'customer_mobile'), '') = '' then
    raise exception 'Name and mobile number are required.';
  end if;

  if jsonb_typeof(payload->'items') <> 'array'
     or jsonb_array_length(payload->'items') = 0 then
    raise exception 'An order must contain at least one item.';
  end if;

  insert into public.orders (
    customer_id, customer_name, customer_mobile, customer_email,
    type, fulfilment, address, notes, est_total, status, source
  ) values (
    auth.uid(),
    payload->>'customer_name',
    payload->>'customer_mobile',
    nullif(payload->>'customer_email', ''),
    coalesce((payload->>'type')::order_type, 'order'),
    coalesce((payload->>'fulfilment')::fulfilment, 'pickup'),
    nullif(payload->>'address', ''),
    nullif(payload->>'notes', ''),
    coalesce((payload->>'est_total')::numeric, 0),
    'new',
    coalesce((payload->>'source')::order_source, 'manual')
  )
  returning orders.id, orders.code into v_order_id, v_code;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    insert into public.order_items (
      order_id, product_id, name, image, width, height, qty,
      base_price, unit_price, line_total, source, reference_photo, sort_order
    ) values (
      v_order_id,
      nullif(v_item->>'product_id', '')::uuid,
      v_item->>'name',
      nullif(v_item->>'image', ''),
      (v_item->>'width')::numeric,
      (v_item->>'height')::numeric,
      (v_item->>'qty')::int,
      (v_item->>'base_price')::numeric,
      (v_item->>'unit_price')::numeric,
      (v_item->>'line_total')::numeric,
      coalesce((v_item->>'source')::order_source, 'manual'),
      nullif(v_item->>'reference_photo', ''),
      coalesce((v_item->>'sort_order')::int, 0)
    );
  end loop;

  return query select v_order_id, v_code;
end;
$$;

-- Guests and signed-in buyers may both check out.
grant execute on function public.place_order(jsonb) to anon, authenticated;
