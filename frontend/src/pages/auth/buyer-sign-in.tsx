import { CONFIG } from 'src/config-global';

import { BuyerSignInView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Sign In - ${CONFIG.appName}`}</title>

      <BuyerSignInView />
    </>
  );
}
