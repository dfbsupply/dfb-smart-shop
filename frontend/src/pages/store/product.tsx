import { CONFIG } from 'src/config-global';

import { StoreProductView } from 'src/sections/store/view/store-product-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Product - ${CONFIG.appName}`}</title>

      <StoreProductView />
    </>
  );
}
