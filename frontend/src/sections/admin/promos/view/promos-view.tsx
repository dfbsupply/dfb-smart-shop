import type { Banner, BannerStatus } from 'src/data/types';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';

import { BANNERS } from 'src/data/mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { useToast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------
// A-7. Promotional Banners Management — pushes live to the Webshop (promoList).
// ----------------------------------------------------------------------

const STATUS_COLOR: Record<BannerStatus, 'success' | 'warning' | 'default'> = {
  active: 'success',
  scheduled: 'warning',
  inactive: 'default',
};

const STATUS_LABEL: Record<BannerStatus, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  inactive: 'Inactive',
};

export function PromosView() {
  const { showToast, toast } = useToast();

  const [banners, setBanners] = useState<Banner[]>(BANNERS);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setEditing({
      id: `b${Date.now()}`,
      image: '/assets/images/cover/cover-5.webp',
      caption: '',
      status: 'inactive',
      order: banners.length + 1,
    });
    setOpenForm(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setOpenForm(true);
  };

  const handleSave = useCallback(() => {
    if (!editing) return;
    setBanners((prev) => {
      const exists = prev.some((b) => b.id === editing.id);
      return exists ? prev.map((b) => (b.id === editing.id ? editing : b)) : [...prev, editing];
    });
    setOpenForm(false);
    showToast('Banner updated. It will appear on the shop instantly.');
  }, [editing, showToast]);

  const handleToggle = (id: string) => {
    setBanners((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' } : b
      )
    );
  };

  const handleDelete = useCallback(() => {
    setBanners((prev) => prev.filter((b) => b.id !== deleteId));
    showToast('Banner deleted.', 'warning');
  }, [deleteId, showToast]);

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Promo Banners
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={openAdd}
        >
          Add Banner
        </Button>
      </Box>

      <Stack spacing={2}>
        {[...banners]
          .sort((a, b) => a.order - b.order)
          .map((banner) => (
            <Card
              key={banner.id}
              sx={{ p: 2, gap: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Box
                component="img"
                src={banner.image}
                alt={banner.caption}
                sx={{ width: 120, height: 68, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
              />

              <Box sx={{ flexGrow: 1, minWidth: 180 }}>
                <Typography variant="subtitle2">{banner.caption || 'Untitled banner'}</Typography>
                <Box sx={{ mt: 0.5, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Label color={STATUS_COLOR[banner.status]}>{STATUS_LABEL[banner.status]}</Label>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Order #{banner.order}
                    {banner.link ? ` · links to ${banner.link}` : ''}
                  </Typography>
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={banner.status === 'active'}
                    onChange={() => handleToggle(banner.id)}
                  />
                }
                label="Active"
              />
              <IconButton onClick={() => openEdit(banner)}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
              <IconButton color="error" onClick={() => setDeleteId(banner.id)}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Card>
          ))}
      </Stack>

      {/* Add / Edit banner form */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing && banners.some((b) => b.id === editing.id) ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
        <DialogContent>
          {editing && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box
                sx={{
                  py: 4,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  color: 'text.secondary',
                  border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
                }}
              >
                <Box
                  component="img"
                  src={editing.image}
                  sx={{ width: 200, height: 100, borderRadius: 1, objectFit: 'cover' }}
                />
                <Button size="small" startIcon={<Iconify icon="solar:cloud-upload-bold" />}>
                  Upload Banner Image
                </Button>
              </Box>

              <TextField
                fullWidth
                label="Caption Text"
                value={editing.caption}
                onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                label="Link to (optional product or category)"
                value={editing.link ?? ''}
                onChange={(e) => setEditing({ ...editing, link: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  label="Status"
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as BannerStatus })}
                  sx={{ flex: 1 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
                <TextField
                  type="number"
                  label="Display Order"
                  value={editing.order}
                  onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                  sx={{ flex: 1 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpenForm(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save Banner
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete this banner?"
        content="This can't be undone."
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      {toast}
    </DashboardContent>
  );
}
