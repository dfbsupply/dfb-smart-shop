import { CONFIG } from 'src/config-global';

import { AiAccuracyView } from 'src/sections/admin/ai-accuracy/view/ai-accuracy-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`AI Accuracy Test - ${CONFIG.appName}`}</title>

      <AiAccuracyView />
    </>
  );
}
