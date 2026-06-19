import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { fPeso } from 'src/data/pricing';
import { placeOrder } from 'src/services/db';
import { sendOrderEmail } from 'src/services/email';

import { useCart } from '../cart-context';
import { saveLastOrder } from '../last-order';

// ----------------------------------------------------------------------
// W-6. Checkout / Place Order — writes an order (no payment gateway).
// ----------------------------------------------------------------------

const MOBILE_RE = /^(09\d{9}|09\d{2}\s?\d{3}\s?\d{4})$/;

export function StoreCheckoutView() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    fulfilment: 'pickup' as 'pickup' | 'delivery',
    address: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (items.length === 0) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Place Your Order
        </Typography>
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            Your cart is empty.
          </Typography>
          <Button component={RouterLink} href="/catalog" variant="contained">
            Start Shopping
          </Button>
        </Card>
      </Box>
    );
  }

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.mobile.trim()) {
      setError('Please enter your name and mobile number.');
      return;
    }
    if (!MOBILE_RE.test(form.mobile.trim())) {
      setError('Please enter a valid mobile number.');
      return;
    }
    if (form.fulfilment === 'delivery' && !form.address.trim()) {
      setError('Please provide a delivery address.');
      return;
    }
    setError('');
    setSubmitting(true);

    const fromVisualSearch = items.some((i) => i.source === 'visual_search');

    try {
      // Write a real order to Supabase (guest order via the place_order RPC).
      const { code } = await placeOrder({
        customerName: form.fullName.trim(),
        customerMobile: form.mobile.trim(),
        customerEmail: form.email.trim() || undefined,
        fulfilment: form.fulfilment,
        address: form.fulfilment === 'delivery' ? form.address.trim() : undefined,
        notes: form.notes.trim() || undefined,
        source: fromVisualSearch ? 'visual_search' : 'manual',
        estTotal: subtotal,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          image: i.image,
          width: i.width,
          height: i.height,
          qty: i.qty,
          basePrice: i.basePrice,
          unitPrice: i.unitPrice,
          lineTotal: Math.round(i.unitPrice * i.qty * 100) / 100,
          source: i.source,
          referencePhoto: i.referencePhoto,
        })),
      });

      // Notify the shop by email (best-effort; never blocks the order).
      void sendOrderEmail({
        code,
        customerName: form.fullName.trim(),
        customerMobile: form.mobile.trim(),
        customerEmail: form.email.trim() || undefined,
        fulfilment: form.fulfilment,
        address: form.fulfilment === 'delivery' ? form.address.trim() : undefined,
        notes: form.notes.trim() || undefined,
        estTotal: subtotal,
        items: items.map((i) => ({
          name: i.name,
          width: i.width,
          height: i.height,
          qty: i.qty,
          unitPrice: i.unitPrice,
        })),
      });

      // Keep a copy for the confirmation page recap.
      saveLastOrder({
        code,
        customerName: form.fullName.trim(),
        customerMobile: form.mobile.trim(),
        fulfilment: form.fulfilment,
        items: items.map((i) => ({
          name: i.name,
          image: i.image,
          width: i.width,
          height: i.height,
          qty: i.qty,
          unitPrice: i.unitPrice,
        })),
        estTotal: subtotal,
      });
      clear();
      router.push('/order-confirmed');
    } catch {
      setSubmitting(false);
      setError('Could not place your order. Please try again.');
    }
  };

  return (
    <Box>
      <Typography variant="h4">Place Your Order</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        No online payment needed. Submit your order and the shop will contact you to confirm details
        and payment.
      </Typography>

      <Grid container spacing={3}>
        {/* Customer details */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            <Stack spacing={2.5}>
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
                placeholder="e.g., 09XX XXX XXXX"
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

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Pickup or Delivery?
                </Typography>
                <RadioGroup
                  value={form.fulfilment}
                  onChange={(e) => set('fulfilment', e.target.value)}
                >
                  <FormControlLabel value="pickup" control={<Radio />} label="Pickup at store" />
                  <FormControlLabel
                    value="delivery"
                    control={<Radio />}
                    label="Request delivery (shop will quote separately)"
                  />
                </RadioGroup>
              </Box>

              {form.fulfilment === 'delivery' && (
                <TextField
                  fullWidth
                  label="Address"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes for the shop"
                placeholder="e.g., preferred finish, schedule, special instructions"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          </Card>
        </Grid>

        {/* Order review */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Review
            </Typography>
            <Stack spacing={1.5}>
              {items.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Box>
                    <Typography variant="body2">{item.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {item.width}×{item.height} in · Qty {item.qty}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{fPeso(item.unitPrice * item.qty)}</Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1">Estimated Total</Typography>
              <Typography variant="h6">{fPeso(subtotal)}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              This total is an estimate. The shop confirms the final amount.
            </Typography>

            <Button
              fullWidth
              size="large"
              variant="contained"
              onClick={handleSubmit}
              loading={submitting}
              sx={{ mt: 3 }}
            >
              Submit Order
            </Button>
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1.5 }}>
              By submitting, you agree the shop may contact you to confirm this order and arrange
              payment.
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
