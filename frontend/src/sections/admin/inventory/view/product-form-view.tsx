import type { ProductCategory } from 'src/data/types';

import { useState } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { PRODUCTS } from 'src/data/mock';
import { PRODUCT_CATEGORIES } from 'src/data/types';
import { DashboardContent } from 'src/layouts/dashboard';

import { useToast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// A-6. Add / Edit Product — sets P_base, images, and visual-search keywords.
// ----------------------------------------------------------------------

type FormState = {
  name: string;
  category: ProductCategory;
  description: string;
  basePrice: string;
  stockQty: string;
  lowStockThreshold: string;
  keywords: string[];
  images: string[];
  visibleInShop: boolean;
  availableForReservation: boolean;
};

const EMPTY: FormState = {
  name: '',
  category: 'Glass',
  description: '',
  basePrice: '',
  stockQty: '',
  lowStockThreshold: '5',
  keywords: [],
  images: [],
  visibleInShop: true,
  availableForReservation: false,
};

export function ProductFormView() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast, toast } = useToast();

  const existing = id ? PRODUCTS.find((p) => p.id === id) : undefined;
  const isEdit = !!existing;

  const [form, setForm] = useState<FormState>(
    existing
      ? {
          name: existing.name,
          category: existing.category,
          description: existing.description,
          basePrice: String(existing.basePrice),
          stockQty: String(existing.stockQty),
          lowStockThreshold: String(existing.lowStockThreshold),
          keywords: existing.keywords,
          images: existing.images,
          visibleInShop: existing.visibleInShop,
          availableForReservation: existing.availableForReservation,
        }
      : EMPTY
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Product name is required.';
    if (!form.basePrice || Number(form.basePrice) <= 0)
      next.basePrice = 'Base price must be a number greater than 0.';
    if (Number(form.stockQty) < 0) next.stockQty = "Stock quantity can't be negative.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    showToast('Product saved.');
    setTimeout(() => router.push('/admin/inventory'), 600);
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 4 }}>
        <Button
          component={RouterLink}
          href="/admin/inventory"
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Inventory
        </Button>
        <Typography variant="h4">{isEdit ? 'Edit Product' : 'Add Product'}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Product Name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                select
                fullWidth
                label="Category"
                value={form.category}
                onChange={(e) => set('category', e.target.value as ProductCategory)}
                slotProps={{ inputLabel: { shrink: true } }}
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  type="number"
                  label="Base Price (₱)"
                  value={form.basePrice}
                  onChange={(e) => set('basePrice', e.target.value)}
                  error={!!errors.basePrice}
                  helperText={errors.basePrice || 'Used as P_base in the price calculator.'}
                  sx={{ flex: 1, minWidth: 180 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  type="number"
                  label="Stock Quantity"
                  value={form.stockQty}
                  onChange={(e) => set('stockQty', e.target.value)}
                  error={!!errors.stockQty}
                  helperText={errors.stockQty}
                  sx={{ flex: 1, minWidth: 180 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  type="number"
                  label="Low-Stock Alert Threshold"
                  value={form.lowStockThreshold}
                  onChange={(e) => set('lowStockThreshold', e.target.value)}
                  sx={{ flex: 1, minWidth: 180 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>

              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={form.keywords}
                onChange={(_, value) => set('keywords', value as string[])}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Visual Search Keywords"
                    placeholder="Add tag and press Enter"
                    helperText='Tags like "glass", "window", "metal", "frame" that the AI uses to bridge photo results to this item.'
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Product Images
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Clear, well-lit images improve visual search matching.
            </Typography>

            <Box
              sx={{
                mt: 2,
                py: 5,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                color: 'text.secondary',
                border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
                cursor: 'pointer',
              }}
            >
              <Iconify icon="solar:cloud-upload-bold-duotone" width={40} />
              <Typography variant="body2">Upload high-resolution photos</Typography>
            </Box>

            {form.images.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {form.images.map((src) => (
                  <Box
                    key={src}
                    component="img"
                    src={src}
                    sx={{ width: 64, height: 64, borderRadius: 1, objectFit: 'cover' }}
                  />
                ))}
              </Box>
            )}
          </Card>

          <Card sx={{ p: 3 }}>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.visibleInShop}
                    onChange={(e) => set('visibleInShop', e.target.checked)}
                  />
                }
                label="Show in shop"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.availableForReservation}
                    onChange={(e) => set('availableForReservation', e.target.checked)}
                  />
                }
                label="Available for reservation"
              />
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

            <Stack spacing={1.5}>
              <Button variant="contained" size="large" onClick={handleSave}>
                Save Product
              </Button>
              <Button component={RouterLink} href="/admin/inventory" variant="outlined" color="inherit">
                Cancel
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {toast}
    </DashboardContent>
  );
}
