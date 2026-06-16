import { CONFIG } from 'src/config-global';

import { OverviewAnalyticsView as DashboardView } from 'src/sections/admin/overview/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="DFB Smart Shop admin dashboard — manage inventory, orders, reservations, and promotional banners."
      />
      <meta name="keywords" content="dfb,smart,shop,admin,inventory,orders,dashboard" />

      <DashboardView />
    </>
  );
}
