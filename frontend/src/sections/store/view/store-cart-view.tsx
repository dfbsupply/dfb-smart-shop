import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { fPeso } from 'src/data/pricing';
import { PRODUCTS, RECOMMENDATIONS } from 'src/data/mock';

import { Iconify } from 'src/components/iconify';

import { useCart } from '../cart-context';
import { StoreProductCard } from '../product-card';

// ----------------------------------------------------------------------
// W-5. Cart Page — carries computed prices (Objective 3) + recommendations.
// ----------------------------------------------------------------------

export function StoreCartView() {
  const { items, subtotal, updateQty, removeItem } = useCart();

  const recommendations = useMemo(() => {
    const inCart = new Set(items.map((i) => i.productId));
    const addonIds = new Set<string>();
    items.forEach((item) => {
      RECOMMENDATIONS.find((r) => r.productId === item.productId)?.addonIds.forEach((id) => {
        if (!inCart.has(id)) addonIds.add(id);
      });
    });
    return PRODUCTS.filter((p) => addonIds.has(p.id)).slice(0, 4);
  }, [items]);

  if (items.length === 0) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Your Cart
        </Typography>
        <Card sx={{ p: 8, textAlign: 'center' }}>
          <Iconify icon="solar:cart-cross-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
          <Typography variant="body1" sx={{ color: 'text.secondary', my: 2 }}>
            Your cart is empty.
          </Typography>
          <Button component={RouterLink} href="/catalog" variant="contained">
            Start Shopping
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Your Cart
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            {items.map((item, index) => (
              <Box key={item.id}>
                {index > 0 && <Divider />}
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar variant="rounded" src={item.image} alt={item.name} sx={{ width: 64, height: 64 }} />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2">{item.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {item.width} in × {item.height} in
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {fPeso(item.unitPrice)} / unit
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => updateQty(item.id, item.qty - 1)}>
                      <Iconify icon="solar:minus-circle-bold" />
                    </IconButton>
                    <Typography sx={{ minWidth: 24, textAlign: 'center' }}>{item.qty}</Typography>
                    <IconButton size="small" onClick={() => updateQty(item.id, item.qty + 1)}>
                      <Iconify icon="solar:add-circle-bold" />
                    </IconButton>
                  </Box>

                  <Box sx={{ textAlign: 'right', minWidth: 90 }}>
                    <Typography variant="subtitle2">{fPeso(item.unitPrice * item.qty)}</Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeItem(item.id)}
                      sx={{ minWidth: 0, p: 0, typography: 'caption' }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}
          </Card>
        </Grid>

        {/* Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Subtotal
              </Typography>
              <Typography variant="subtitle2">{fPeso(subtotal)}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Taxes and delivery (if any) are arranged with the shop.
            </Typography>
            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="subtitle1">Estimated Total</Typography>
              <Typography variant="h6">{fPeso(subtotal)}</Typography>
            </Box>
            <Button
              fullWidth
              size="large"
              variant="contained"
              component={RouterLink}
              href="/checkout"
            >
              Proceed to Order
            </Button>
          </Card>
        </Grid>
      </Grid>

      {recommendations.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            You might also need:
          </Typography>
          <Grid container spacing={3}>
            {recommendations.map((product) => (
              <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <StoreProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
