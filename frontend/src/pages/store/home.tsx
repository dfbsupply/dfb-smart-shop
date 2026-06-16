import { CONFIG } from 'src/config-global';

import { StoreHomeView } from 'src/sections/store/view/store-home-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`${CONFIG.appName} — Glass & Aluminum, Made Simple`}</title>

      <StoreHomeView />
    </>
  );
}
