import { CONFIG } from 'src/config-global';

import { StoreContactView } from 'src/sections/store/view/store-contact-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Contact - ${CONFIG.appName}`}</title>

      <StoreContactView />
    </>
  );
}
