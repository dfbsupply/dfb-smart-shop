import { CONFIG } from 'src/config-global';

import { OrdersView } from 'src/sections/admin/orders/view/orders-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Orders - ${CONFIG.appName}`}</title>

      <OrdersView />
    </>
  );
}
