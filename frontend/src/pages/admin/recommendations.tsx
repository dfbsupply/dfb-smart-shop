import { CONFIG } from 'src/config-global';

import { RecommendationsView } from 'src/sections/admin/recommendations/view/recommendations-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Recommendations - ${CONFIG.appName}`}</title>

      <RecommendationsView />
    </>
  );
}
