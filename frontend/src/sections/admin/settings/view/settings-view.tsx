import type { StaffAccount } from 'src/data/types';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';

import { useAsync } from 'src/hooks/use-async';

import { fetchSettings } from 'src/services/db';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { useToast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// A-10. Settings — shop profile, configurable pricing constants, staff.
// ----------------------------------------------------------------------

export function SettingsView() {
  const { showToast, toast } = useToast();

  const { data: settings } = useAsync(fetchSettings, []);

  const [profile, setProfile] = useState({ name: '', address: '', contact: '', hours: '' });
  const [surfaceMultiplier, setSurfaceMultiplier] = useState('1.5');
  const [perimeterMultiplier, setPerimeterMultiplier] = useState('2');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');

  useEffect(() => {
    if (!settings) return;
    setProfile({
      name: settings.name,
      address: settings.address,
      contact: settings.contact,
      hours: settings.hours,
    });
    setSurfaceMultiplier(String(settings.surfaceMultiplier));
    setPerimeterMultiplier(String(settings.perimeterMultiplier));
    setLowStockThreshold(String(settings.lowStockThreshold));
    setStaff(settings.staff);
  }, [settings]);

  const addStaff = () => {
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;
    setStaff((prev) => [
      ...prev,
      { id: `s${Date.now()}`, name: newStaffName, email: newStaffEmail, role: 'Staff' },
    ]);
    setNewStaffName('');
    setNewStaffEmail('');
  };

  const removeStaff = (id: string) => setStaff((prev) => prev.filter((s) => s.id !== id));

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Shop Profile" />
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Shop Name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  fullWidth
                  label="Address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  fullWidth
                  label="Contact"
                  value={profile.contact}
                  onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  fullWidth
                  label="Store Hours"
                  value={profile.hours}
                  onChange={(e) => setProfile({ ...profile, hours: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Pricing Defaults"
              subheader="Adjust the multipliers used in the price formula: base + area × surface + perimeter × perimeter."
            />
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Surface-area Multiplier"
                  value={surfaceMultiplier}
                  onChange={(e) => setSurfaceMultiplier(e.target.value)}
                  helperText="Default 1.5"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Perimeter Multiplier"
                  value={perimeterMultiplier}
                  onChange={(e) => setPerimeterMultiplier(e.target.value)}
                  helperText="Default 2"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Low-Stock Threshold Default"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      endAdornment: <InputAdornment position="end">units</InputAdornment>,
                    },
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title="Staff Accounts" subheader="Add or remove authorized admin users." />
            <CardContent>
              <Stack spacing={1.5} sx={{ mb: 3 }}>
                {staff.map((s) => (
                  <Box
                    key={s.id}
                    sx={{
                      p: 1.5,
                      gap: 2,
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: 1,
                      bgcolor: (theme) => theme.vars.palette.background.neutral,
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2">{s.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {s.email}
                      </Typography>
                    </Box>
                    <Label color={s.role === 'Owner' ? 'primary' : 'default'}>{s.role}</Label>
                    <IconButton
                      color="error"
                      disabled={s.role === 'Owner'}
                      onClick={() => removeStaff(s.id)}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ borderStyle: 'dashed', mb: 3 }} />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  label="Name"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  sx={{ flex: 1, minWidth: 180 }}
                />
                <TextField
                  label="Email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  sx={{ flex: 1, minWidth: 180 }}
                />
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={addStaff}
                >
                  Add Staff
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          size="large"
          variant="contained"
          onClick={() => showToast('Changes saved.')}
        >
          Save Settings
        </Button>
      </Box>

      {toast}
    </DashboardContent>
  );
}
