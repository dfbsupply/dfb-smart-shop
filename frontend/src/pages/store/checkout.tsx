import { CONFIG } from 'src/config-global';

import { StoreCheckoutView } from 'src/sections/store/view/store-checkout-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Checkout - ${CONFIG.appName}`}</title>

      <StoreCheckoutView />
    </>
  );
}
