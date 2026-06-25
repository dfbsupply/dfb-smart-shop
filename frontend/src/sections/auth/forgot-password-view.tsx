import { useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { useAuth } from 'src/auth';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Forgot Password — shared by the admin and buyer sign-in flows. Sends a reset
// email via Supabase Auth (sendPasswordReset → resetPasswordForEmail), which
// links to the /login/reset page. `signInHref` controls where the "Back to sign
// in" link goes for each audience.
// ----------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  signInHref: string;
  title?: string;
};

export function ForgotPasswordView({ signInHref, title = 'Forgot your password?' }: Props) {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    const { error: resetError } = await sendPasswordReset(email.trim());
    setLoading(false);
    if (resetError) {
      setError("Couldn't send the reset link. Please try again.");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Iconify icon="solar:letter-opened-bold-duotone" width={64} sx={{ color: 'primary.main' }} />
        <Typography variant="h5" sx={{ mt: 2 }}>
          Check your email
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset your
          password.
        </Typography>
        <Button component={RouterLink} href={signInHref} variant="contained">
          Back to Sign In
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5">{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Enter your email and we&apos;ll send you a link to reset it.
        </Typography>
      </Box>

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
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button fullWidth size="large" type="submit" variant="contained" loading={loading}>
          Send Reset Link
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Link component={RouterLink} href={signInHref} variant="body2" color="inherit">
          ← Back to Sign In
        </Link>
      </Box>
    </Box>
  );
}
