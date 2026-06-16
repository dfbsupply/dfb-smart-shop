import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// A-1. Admin Sign In — Firebase Authentication, admin role (Objective 4).
// ----------------------------------------------------------------------

// Demo credentials standing in for Firebase Auth + an admin-role check.
const ADMIN_EMAIL = 'owner@dfbsmartshop.com';
const ADMIN_PASSWORD = 'admin1234';

export function AdminSignInView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = useCallback(() => {
    // Stand-in for Firebase Auth. Replace with signInWithEmailAndPassword and
    // an admin-role lookup against the Realtime Database.
    if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError('Incorrect email or password.');
      return;
    }
    setError('');
    router.push('/admin');
  }, [email, password, router]);

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">DFB Smart Shop — Admin</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Sign in to manage inventory and orders.
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
        sx={{ display: 'flex', flexDirection: 'column' }}
      >
        <TextField
          fullWidth
          name="email"
          label="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 3 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          fullWidth
          name="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          type={showPassword ? 'text' : 'password'}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 3 }}
        />

        <Button fullWidth size="large" type="submit" color="inherit" variant="contained">
          Sign In
        </Button>

        <Link
          component={RouterLink}
          href="/login/admin/forgot-password"
          variant="body2"
          color="inherit"
          sx={{ mt: 2, alignSelf: 'center' }}
        >
          Forgot password?
        </Link>
      </Box>

      <Typography
        variant="caption"
        sx={{ mt: 3, display: 'block', textAlign: 'center', color: 'text.secondary' }}
      >
        Authorized staff only.
      </Typography>
    </>
  );
}
