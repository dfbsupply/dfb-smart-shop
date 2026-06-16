import { CONFIG } from 'src/config-global';

import { StoreAboutView } from 'src/sections/store/view/store-about-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`About - ${CONFIG.appName}`}</title>

      <StoreAboutView />
    </>
  );
}
