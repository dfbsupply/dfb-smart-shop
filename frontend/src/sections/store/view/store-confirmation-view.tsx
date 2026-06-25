import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { fPeso, formatItemSize } from 'src/data/pricing';

import { Iconify } from 'src/components/iconify';

import { readLastOrder } from '../last-order';

// ----------------------------------------------------------------------
// W-7. Order Confirmation Page — order saved for admin retrieval.
// ----------------------------------------------------------------------

export function StoreConfirmationView() {
  const order = readLastOrder();

  if (!order) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          No recent order found.
        </Typography>
        <Button component={RouterLink} href="/catalog" variant="contained">
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', textAlign: 'center', py: 4 }}>
      <Iconify icon="solar:check-circle-bold" width={72} sx={{ color: 'success.main' }} />
      <Typography variant="h3" sx={{ mt: 2 }}>
        Order Received!
      </Typography>
      <Typography variant="h6" sx={{ color: 'text.secondary', mt: 1 }}>
        Your order number is {order.code}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2 }}>
        Thank you, {order.customerName}. We&apos;ve sent your order to the shop. Our team will contact
        you at {order.customerMobile} to confirm details and payment.
      </Typography>

      <Card sx={{ p: 3, mt: 4, textAlign: 'left' }}>
        <Stack spacing={1.5}>
          {order.items.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="body2">{item.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {formatItemSize(item.width, item.height)} · Qty {item.qty}
                </Typography>
              </Box>
              <Typography variant="body2">{fPeso(item.unitPrice * item.qty)}</Typography>
            </Box>
          ))}
        </Stack>
        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">Estimated Total</Typography>
          <Typography variant="h6">{fPeso(order.estTotal)}</Typography>
        </Box>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
        <Button component={RouterLink} href="/buyer/orders" variant="contained">
          View My Orders
        </Button>
        <Button component={RouterLink} href="/catalog" variant="outlined" color="inherit">
          Continue Shopping
        </Button>
      </Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 3 }}>
        Save your order number for reference.
      </Typography>
    </Box>
  );
}
