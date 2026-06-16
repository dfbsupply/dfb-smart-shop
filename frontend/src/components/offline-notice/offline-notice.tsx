import { useState, useEffect } from 'react';

import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Required by scope: the admin needs an active internet connection to sync
// with Firebase. Surface a clear notice when the browser goes offline.
// ----------------------------------------------------------------------

export function OfflineNotice() {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <Alert
      severity="warning"
      icon={<Iconify icon="solar:wi-fi-router-minimalistic-bold" />}
      sx={{ mb: 3 }}
    >
      You&apos;re offline. Changes can&apos;t be saved until you reconnect to the internet.
    </Alert>
  );
}
