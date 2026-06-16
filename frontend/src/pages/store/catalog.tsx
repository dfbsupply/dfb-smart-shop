import { CONFIG } from 'src/config-global';

import { StoreCatalogView } from 'src/sections/store/view/store-catalog-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Shop - ${CONFIG.appName}`}</title>

      <StoreCatalogView />
    </>
  );
}
