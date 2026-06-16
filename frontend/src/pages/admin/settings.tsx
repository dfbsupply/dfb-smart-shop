import { CONFIG } from 'src/config-global';

import { SettingsView } from 'src/sections/admin/settings/view/settings-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Settings - ${CONFIG.appName}`}</title>

      <SettingsView />
    </>
  );
}
