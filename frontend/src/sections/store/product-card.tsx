import type { Product } from 'src/data/types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { fPeso } from 'src/data/pricing';
import { getStockStatus, STOCK_STATUS_LABEL, STOCK_STATUS_COLOR } from 'src/data/status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function StoreProductCard({ product }: { product: Product }) {
  const stock = getStockStatus(product);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
      <Box
        component={RouterLink}
        href={`/product/${product.id}`}
        sx={{ position: 'relative', display: 'block', pt: '75%', overflow: 'hidden' }}
      >
        <Box
          component="img"
          src={product.images[0]}
          alt={product.name}
          sx={{
            top: 0,
            width: 1,
            height: 1,
            objectFit: 'cover',
            position: 'absolute',
          }}
        />
        <Label
          color={STOCK_STATUS_COLOR[stock]}
          sx={{ position: 'absolute', top: 12, right: 12 }}
        >
          {STOCK_STATUS_LABEL[stock]}
        </Label>
      </Box>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Typography variant="subtitle2" noWrap>
          {product.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
          {product.category}
        </Typography>
        {product.dimensions && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
            noWrap
          >
            <Iconify icon="solar:ruler-bold" width={14} />
            {product.dimensions}
          </Typography>
        )}

        <Box sx={{ flex: 1 }} />

        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Starts at
            </Typography>
            <Typography variant="subtitle1">{fPeso(product.basePrice)}</Typography>
          </Box>
          <Button
            component={RouterLink}
            href={`/product/${product.id}`}
            variant="outlined"
            color="inherit"
            size="small"
          >
            View Item
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
