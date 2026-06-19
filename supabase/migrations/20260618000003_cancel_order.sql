-- ============================================================================
-- DFB Smart Shop — cancel_order RPC (Phase 4 follow-up)
-- Lets a buyer cancel their OWN order while it is still cancellable
-- (status 'new' or 'pending'). Kept out of RLS as a SECURITY DEFINER function
-- so buyers get a single, safe, column-scoped action instead of a general
-- UPDATE grant on orders.
-- ============================================================================

create or replace function public.cancel_order(order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
  set status = 'cancelled'
  where id = order_id
    and customer_id = auth.uid()        -- only the owner
    and status in ('new', 'pending');   -- only before the shop confirms

  if not found then
    raise exception 'Order cannot be cancelled (not found, not yours, or already in progress).';
  end if;
end;
$$;

-- Only signed-in buyers may call it (guests have no auth.uid()).
revoke all on function public.cancel_order(uuid) from public, anon;
grant execute on function public.cancel_order(uuid) to authenticated;
