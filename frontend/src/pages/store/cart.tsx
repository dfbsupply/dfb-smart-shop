import { CONFIG } from 'src/config-global';

import { StoreCartView } from 'src/sections/store/view/store-cart-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Cart - ${CONFIG.appName}`}</title>

      <StoreCartView />
    </>
  );
}
