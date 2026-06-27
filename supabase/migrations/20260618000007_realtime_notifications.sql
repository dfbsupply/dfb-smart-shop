-- ---------------------------------------------------------------------------
-- Realtime: publish the `notifications` table so the buyer's unread bell badge
-- updates live the moment an admin sends a notification (price confirmed /
-- status changed). Realtime still respects RLS, so a buyer only receives their
-- own rows. Idempotent — safe to run more than once.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
