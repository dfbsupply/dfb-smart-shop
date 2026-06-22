import { CONFIG } from 'src/config-global';

import { ResetPasswordView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Set New Password - ${CONFIG.appName}`}</title>

      <ResetPasswordView />
    </>
  );
}
