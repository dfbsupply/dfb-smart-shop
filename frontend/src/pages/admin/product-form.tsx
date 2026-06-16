import { CONFIG } from 'src/config-global';

import { ProductFormView } from 'src/sections/admin/inventory/view/product-form-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Product - ${CONFIG.appName}`}</title>

      <ProductFormView />
    </>
  );
}
