import { CONFIG } from 'src/config-global';

import { ForgotPasswordView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Reset Password - ${CONFIG.appName}`}</title>

      <ForgotPasswordView signInHref="/login" />
    </>
  );
}
