import { CONFIG } from 'src/config-global';

import { BuyerRegisterView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Create Account - ${CONFIG.appName}`}</title>

      <BuyerRegisterView />
    </>
  );
}
