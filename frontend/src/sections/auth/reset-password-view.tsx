import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useAuth } from 'src/auth';
import { supabase } from 'src/lib/supabase';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Set New Password — the landing page for the Supabase password-reset email
// link. Supabase establishes a recovery session from the link (detected on
// load); the user then sets a new password via updateUser().
// ----------------------------------------------------------------------

export function ResetPasswordView() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [ready, setReady] = useState(false); // recovery session detected?
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The recovery link puts a session in the URL; supabase-js parses it and
    // fires PASSWORD_RECOVERY. Also check any already-restored session.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (password.length < 8) {
      setError('Please use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    const { error: updateError } = await updatePassword(password);
    setLoading(false);
    if (updateError) {
      setError(updateError);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Iconify icon="solar:check-circle-bold-duotone" width={64} sx={{ color: 'success.main' }} />
        <Typography variant="h5" sx={{ mt: 2 }}>
          Password updated
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>
          You can now sign in with your new password.
        </Typography>
        <Button variant="contained" onClick={() => router.push('/login')}>
          Go to Sign In
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5">Set a new password</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Enter and confirm your new password below.
        </Typography>
      </Box>

      {!ready && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Open this page from the reset link in your email. If you got here directly, request a new
          link from <RouterLink href="/login/forgot-password">Forgot password</RouterLink>.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
      >
        <TextField
          fullWidth
          type="password"
          label="New Password"
          helperText="At least 8 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          fullWidth
          type="password"
          label="Confirm New Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={loading}
          disabled={!ready}
        >
          Update Password
        </Button>
      </Box>
    </Box>
  );
}
