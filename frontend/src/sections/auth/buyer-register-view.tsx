import { useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Logo } from 'src/components/logo';

// ----------------------------------------------------------------------
// B-2. Create Account / Register Page — Firebase Authentication (Objective 4).
// ----------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BuyerRegisterView() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirm: '',
    agree: false,
  });
  const [error, setError] = useState('');

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCreate = () => {
    if (!EMAIL_RE.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 8) {
      setError('Please use at least 8 characters for your password.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    router.push('/buyer');
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Logo sx={{ mx: 'auto', mb: 3 }} />
        <Typography variant="h4">Create Your Account</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Save your details for faster ordering.
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
          handleCreate();
        }}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
      >
        <TextField
          fullWidth
          label="Full Name"
          value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          fullWidth
          label="Mobile Number"
          placeholder="09XX XXX XXXX"
          value={form.mobile}
          onChange={(e) => set('mobile', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          fullWidth
          label="Email Address"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          fullWidth
          type="password"
          label="Password"
          helperText="At least 8 characters."
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          fullWidth
          type="password"
          label="Confirm Password"
          value={form.confirm}
          onChange={(e) => set('confirm', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.agree}
              onChange={(e) => set('agree', e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              I agree the shop may contact me to confirm my orders.
            </Typography>
          }
        />
        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={!form.agree}
        >
          Create Account
        </Button>
      </Box>

      <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
        Already have an account?{' '}
        <RouterLink href="/login" style={{ fontWeight: 600 }}>
          Sign In
        </RouterLink>
      </Typography>
    </Box>
  );
}
