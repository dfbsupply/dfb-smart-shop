import { CONFIG } from 'src/config-global';

import { BuyerProfileView } from 'src/sections/buyer/view/buyer-profile-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`My Profile - ${CONFIG.appName}`}</title>

      <BuyerProfileView />
    </>
  );
}
