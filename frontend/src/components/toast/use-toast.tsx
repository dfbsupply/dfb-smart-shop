import { useState, useCallback } from 'react';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// ----------------------------------------------------------------------
// Lightweight toast (A-11 save-confirmation toasts). Usage:
//   const { showToast, toast } = useToast();
//   showToast('Changes saved.');
//   return (<>... {toast}</>);
// ----------------------------------------------------------------------

type Severity = 'success' | 'info' | 'warning' | 'error';

export function useToast() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<Severity>('success');

  const showToast = useCallback((msg: string, sev: Severity = 'success') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  const toast = (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );

  return { showToast, toast };
}
