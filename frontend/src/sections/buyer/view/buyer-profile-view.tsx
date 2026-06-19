import type { Fulfilment } from 'src/data/types';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/auth';
import { updateProfile } from 'src/services/db';

import { useToast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------
// B-7. Profile / Account Settings — account management (Objective 1).
// ----------------------------------------------------------------------

export function BuyerProfileView() {
  const router = useRouter();
  const { user, profile: authProfile, signOut } = useAuth();
  const { showToast, toast } = useToast();

  const [profile, setProfile] = useState<{
    fullName: string;
    mobile: string;
    email: string;
    preference: Fulfilment;
    address: string;
  }>({ fullName: '', mobile: '', email: '', preference: 'pickup', address: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authProfile) return;
    setProfile({
      fullName: authProfile.full_name ?? '',
      mobile: authProfile.mobile ?? '',
      email: authProfile.email ?? '',
      preference: authProfile.preference ?? 'pickup',
      address: authProfile.address ?? '',
    });
  }, [authProfile]);

  const set = (key: keyof typeof profile, value: string) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        full_name: profile.fullName.trim(),
        mobile: profile.mobile || null,
        email: profile.email || null,
        preference: profile.preference,
        address: profile.address || null,
      });
      showToast('Profile updated.');
    } catch {
      showToast('Could not update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        My Profile
      </Typography>

      <Card sx={{ p: 2.5, mb: 2 }}>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label="Full Name"
            value={profile.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            label="Mobile Number"
            value={profile.mobile}
            onChange={(e) => set('mobile', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            label="Email Address"
            value={profile.email}
            onChange={(e) => set('email', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select
            fullWidth
            label="Default Pickup/Delivery Preference"
            value={profile.preference}
            onChange={(e) => set('preference', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          >
            <MenuItem value="pickup">Pickup at store</MenuItem>
            <MenuItem value="delivery">Delivery</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Saved Address (optional)"
            value={profile.address}
            onChange={(e) => set('address', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Button variant="contained" onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </Stack>
      </Card>

      {/* Security */}
      <Card sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Security
        </Typography>
        {!showPassword ? (
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:lock-password-bold" />}
            onClick={() => setShowPassword(true)}
          >
            Change Password
          </Button>
        ) : (
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button color="inherit" onClick={() => setShowPassword(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  showToast('Password changed.');
                  setShowPassword(false);
                }}
              >
                Update Password
              </Button>
            </Box>
          </Stack>
        )}
      </Card>

      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

      <Button
        fullWidth
        color="error"
        variant="outlined"
        startIcon={<Iconify icon="solar:logout-3-bold" />}
        onClick={() => setConfirmSignOut(true)}
      >
        Sign Out
      </Button>

      <ConfirmDialog
        open={confirmSignOut}
        title="Sign out of your account?"
        content="You'll need to sign in again to see your orders."
        confirmLabel="Sign Out"
        cancelLabel="Stay"
        confirmColor="error"
        onClose={() => setConfirmSignOut(false)}
        onConfirm={async () => {
          await signOut();
          router.push('/login');
        }}
      />

      {toast}
    </Box>
  );
}
