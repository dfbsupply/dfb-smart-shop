import { useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { CURRENT_BUYER } from 'src/data/mock';

import { Logo } from 'src/components/logo';

// ----------------------------------------------------------------------
// B-1. Sign In Page — Firebase Authentication (Objective 4).
// ----------------------------------------------------------------------

const DEMO_PASSWORD = 'buyer1234';

export function BuyerSignInView() {
  const router = useRouter();

  const [email, setEmail] = useState(CURRENT_BUYER.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (email.trim().toLowerCase() !== CURRENT_BUYER.email) {
      setError("This account doesn't exist. Try creating one.");
      return;
    }
    if (password !== DEMO_PASSWORD) {
      setError('Incorrect email or password.');
      return;
    }
    setError('');
    router.push('/buyer');
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Logo sx={{ mx: 'auto', mb: 3 }} />
        <Typography variant="h4">Welcome Back</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Sign in to track your orders and reservations.
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
          handleSignIn();
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
        <TextField
          fullWidth
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Link
          component={RouterLink}
          href="/login/forgot-password"
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end' }}
        >
          Forgot password?
        </Link>
        <Button fullWidth size="large" type="submit" variant="contained">
          Sign In
        </Button>
      </Box>

      <Divider sx={{ my: 3, typography: 'body2', color: 'text.disabled' }}>New here?</Divider>

      <Button
        fullWidth
        size="large"
        variant="outlined"
        color="inherit"
        component={RouterLink}
        href="/login/register"
      >
        Create an Account
      </Button>
    </Box>
  );
}
