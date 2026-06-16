import { CONFIG } from 'src/config-global';

import { StoreVisualSearchView } from 'src/sections/store/view/store-visual-search-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Visual Search - ${CONFIG.appName}`}</title>

      <StoreVisualSearchView />
    </>
  );
}
