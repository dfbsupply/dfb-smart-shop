import { CONFIG } from 'src/config-global';

import { BuyerNotificationsView } from 'src/sections/buyer/view/buyer-notifications-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Notifications - ${CONFIG.appName}`}</title>

      <BuyerNotificationsView />
    </>
  );
}
