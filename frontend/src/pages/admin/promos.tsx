import { CONFIG } from 'src/config-global';

import { PromosView } from 'src/sections/admin/promos/view/promos-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Promo Banners - ${CONFIG.appName}`}</title>

      <PromosView />
    </>
  );
}
