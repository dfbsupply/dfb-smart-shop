import { CONFIG } from 'src/config-global';

import { BuyerOrderDetailView } from 'src/sections/buyer/view/buyer-order-detail-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Order Detail - ${CONFIG.appName}`}</title>

      <BuyerOrderDetailView />
    </>
  );
}
