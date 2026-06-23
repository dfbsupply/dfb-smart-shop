import { CONFIG } from 'src/config-global';

import { StoreQuoteView } from 'src/sections/store/view/store-quote-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Instant Quote - ${CONFIG.appName}`}</title>

      <StoreQuoteView />
    </>
  );
}
