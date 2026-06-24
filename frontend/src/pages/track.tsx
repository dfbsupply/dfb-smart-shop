import { CONFIG } from 'src/config-global';

import { RiderTrackView } from 'src/sections/tracking/rider-track-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Rider Tracking - ${CONFIG.appName}`}</title>

      <RiderTrackView />
    </>
  );
}
