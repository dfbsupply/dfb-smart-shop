import { CONFIG } from 'src/config-global';

import { StoreConfirmationView } from 'src/sections/store/view/store-confirmation-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Order Received - ${CONFIG.appName}`}</title>

      <StoreConfirmationView />
    </>
  );
}
