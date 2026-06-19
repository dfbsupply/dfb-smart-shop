import { useState } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { RouterLink } from 'src/routes/components';

import { useAsync } from 'src/hooks/use-async';

import { fPeso, computeUnitPrice, type PriceBreakdown } from 'src/data/pricing';
import { getStockStatus, STOCK_STATUS_LABEL, STOCK_STATUS_COLOR } from 'src/data/status';
import { fetchProduct, fetchVisibleProducts, fetchRecommendations } from 'src/services/db';

import { Label } from 'src/components/label';
import { useToast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';

import { useCart } from '../cart-context';
import { StoreProductCard } from '../product-card';
import { getVisualRef, clearVisualRef } from '../visual-search-session';

// ----------------------------------------------------------------------
// W-3. Product Detail — dynamic pricing (Objective 3) + recommendations (5).
// ----------------------------------------------------------------------

export function StoreProductView() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { showToast, toast } = useToast();

  const { data, loading } = useAsync(async () => {
    if (!id) return null;
    const [product, products, recs] = await Promise.all([
      fetchProduct(id),
      fetchVisibleProducts(),
      fetchRecommendations(),
    ]);
    return { product, products, recs };
  }, [id]);
  const product = data?.product ?? null;

  // If the customer arrived from Visual Search for this product, keep the photo
  // so it can be attached to the cart line (and later shown to the admin).
  const visualRef = getVisualRef();
  const referencePhoto =
    visualRef && visualRef.productId === id ? visualRef.photo : undefined;

  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [qty, setQty] = useState('1');
  const [error, setError] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [result, setResult] = useState<PriceBreakdown | null>(null);

  if (loading) {
    return <LinearProgress sx={{ mt: 2 }} />;
  }

  if (!product) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Product not found
        </Typography>
        <Button component={RouterLink} href="/catalog" color="inherit">
          Back to Shop
        </Button>
      </Box>
    );
  }

  const stock = getStockStatus(product);
  const quantity = Math.max(1, Number(qty) || 1);

  const recommended = (data?.recs.find((r) => r.productId === product.id)?.addonIds ?? [])
    .map((addonId) => data?.products.find((p) => p.id === addonId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const handleCalculate = () => {
    if (!width || !height) {
      setError('Please enter both width and height.');
      setResult(null);
      return;
    }
    const w = Number(width);
    const h = Number(height);
    if (Number.isNaN(w) || Number.isNaN(h)) {
      setError('Please enter numbers only.');
      setResult(null);
      return;
    }
    if (w <= 0 || h <= 0) {
      setError('Measurements must be greater than 0.');
      setResult(null);
      return;
    }
    setError('');
    setResult(computeUnitPrice({ base: product.basePrice, width: w, height: h }));
  };

  const handleAddToCart = () => {
    if (!result) {
      handleCalculate();
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      basePrice: product.basePrice,
      width: Number(width),
      height: Number(height),
      qty: quantity,
      unitPrice: result.unit,
      source: referencePhoto ? 'visual_search' : 'manual',
      referencePhoto,
    });
    clearVisualRef();
    showToast('Added to cart.');
  };

  return (
    <Box>
      <Button
        component={RouterLink}
        href="/catalog"
        color="inherit"
        size="small"
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
        sx={{ mb: 2 }}
      >
        Shop
      </Button>

      <Grid container spacing={4}>
        {/* Gallery */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <Box
              component="img"
              src={product.images[0]}
              alt={product.name}
              sx={{ width: 1, aspectRatio: '4/3', objectFit: 'cover' }}
            />
          </Card>
        </Grid>

        {/* Info + estimator */}
        <Grid size={{ xs: 12, md: 6 }}>
          {referencePhoto && (
            <Card
              sx={{
                p: 1.5,
                mb: 2,
                gap: 1.5,
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'background.neutral',
              }}
            >
              <Avatar variant="rounded" src={referencePhoto} sx={{ width: 48, height: 48 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">Matched from your photo</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Your photo will be sent with the order so the shop can confirm the exact part.
                </Typography>
              </Box>
              <Iconify icon="solar:camera-bold-duotone" sx={{ color: 'primary.main' }} />
            </Card>
          )}

          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <Label color="default">{product.category}</Label>
            <Label color={STOCK_STATUS_COLOR[stock]}>{STOCK_STATUS_LABEL[stock]}</Label>
          </Box>
          <Typography variant="h4">{product.name}</Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', my: 1 }}>
            Base Price: {fPeso(product.basePrice)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {product.description}
          </Typography>

          <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
            <Typography variant="h6">Get Your Price</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Enter your measurements to calculate the cost for your exact size.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Width (inches)"
                placeholder="e.g., 24"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Height (inches)"
                placeholder="e.g., 36"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Quantity"
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                sx={{ width: 110 }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button variant="contained" color="inherit" onClick={handleCalculate}>
              Calculate Price
            </Button>

            {result && (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Estimated Price:
                  </Typography>
                  <Typography variant="h4">{fPeso(result.unit * quantity)}</Typography>
                </Box>

                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setShowBreakdown((v) => !v)}
                  endIcon={
                    <Iconify
                      icon={showBreakdown ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                    />
                  }
                >
                  See how this is computed
                </Button>
                <Collapse in={showBreakdown}>
                  <Box sx={{ mt: 1 }}>
                    <Row label="Base material" value={fPeso(result.base)} />
                    <Row label="Surface area (W × H × 1.5)" value={fPeso(result.surface)} />
                    <Row label="Frame / perimeter ((W + H) × 2)" value={fPeso(result.perimeter)} />
                    <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />
                    <Row label={`Per unit total × ${quantity}`} value={fPeso(result.unit * quantity)} bold />
                  </Box>
                </Collapse>

                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1 }}>
                  This is an estimate. Final price is confirmed by the shop based on stock and
                  finishing.
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Iconify icon="solar:cart-plus-bold" />}
                  onClick={handleAddToCart}
                  sx={{ mt: 2 }}
                >
                  Add to Cart
                </Button>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Recommendations */}
      {recommended.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5">Frequently Bought Together</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Customers who chose this also added:
          </Typography>
          <Grid container spacing={3}>
            {recommended.map((rec) => (
              <Grid key={rec.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <StoreProductCard product={rec} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button component={RouterLink} href="/cart" color="inherit">
          Go to Cart →
        </Button>
      </Box>

      {toast}
    </Box>
  );
}

// ----------------------------------------------------------------------

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.25 }}>
      <Typography variant={bold ? 'subtitle2' : 'body2'} sx={{ color: bold ? 'text.primary' : 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant={bold ? 'subtitle2' : 'body2'}>{value}</Typography>
    </Box>
  );
}
