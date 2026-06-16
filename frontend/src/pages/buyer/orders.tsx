import { CONFIG } from 'src/config-global';

import { BuyerOrdersView } from 'src/sections/buyer/view/buyer-orders-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`My Orders - ${CONFIG.appName}`}</title>

      <BuyerOrdersView />
    </>
  );
}
