import { CONFIG } from 'src/config-global';

import { BuyerHomeView } from 'src/sections/buyer/view/buyer-home-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`My Account - ${CONFIG.appName}`}</title>

      <BuyerHomeView />
    </>
  );
}
