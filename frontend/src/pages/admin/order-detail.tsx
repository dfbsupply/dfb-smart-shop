import { CONFIG } from 'src/config-global';

import { OrderDetailView } from 'src/sections/admin/orders/view/order-detail-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Order Detail - ${CONFIG.appName}`}</title>

      <OrderDetailView />
    </>
  );
}
