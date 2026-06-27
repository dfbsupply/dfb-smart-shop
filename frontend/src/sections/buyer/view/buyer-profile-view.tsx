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

import { useAuth } from 'src/auth';
import { updateProfile } from 'src/services/db';

import { useToast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// B-7. Profile / Account Settings — account management (Objective 1).
// ----------------------------------------------------------------------

export function BuyerProfileView() {
  const { user, profile: authProfile, signIn, updatePassword, requestSignOut } = useAuth();
  const { showToast, toast } = useToast();

  const [profile, setProfile] = useState<{
    fullName: string;
    mobile: string;
    email: string;
    preference: Fulfilment;
    address: string;
  }>({ fullName: '', mobile: '', email: '', preference: 'pickup', address: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [changingPw, setChangingPw] = useState(false);
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

  const handleUpdatePassword = async () => {
    if (pw.next.length < 8) {
      showToast('New password must be at least 8 characters.', 'error');
      return;
    }
    if (pw.next !== pw.confirm) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    const email = user?.email;
    if (!email) {
      showToast('No account email found.', 'error');
      return;
    }
    setChangingPw(true);
    try {
      // Verify the current password by re-authenticating, then update it.
      const { error: verifyError } = await signIn(email, pw.current);
      if (verifyError) {
        showToast('Current password is incorrect.', 'error');
        return;
      }
      const { error } = await updatePassword(pw.next);
      if (error) {
        showToast('Could not update password.', 'error');
        return;
      }
      showToast('Password changed.');
      setShowPassword(false);
      setPw({ current: '', next: '', confirm: '' });
    } finally {
      setChangingPw(false);
    }
  };

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
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              helperText="At least 8 characters"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                color="inherit"
                onClick={() => {
                  setShowPassword(false);
                  setPw({ current: '', next: '', confirm: '' });
                }}
              >
                Cancel
              </Button>
              <Button variant="contained" loading={changingPw} onClick={handleUpdatePassword}>
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
        onClick={requestSignOut}
      >
        Sign Out
      </Button>

      {toast}
    </Box>
  );
}
