import type { Product } from 'src/data/types';
import type { Prediction } from 'src/services/ai';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { fPeso } from 'src/data/pricing';
import { getStockStatus } from 'src/data/status';
import { fetchVisibleProducts } from 'src/services/db';
import { classifyImage, matchProductsByLabels } from 'src/services/ai';

import { Iconify } from 'src/components/iconify';

import { setVisualRef } from '../visual-search-session';
import { fileToImage, imageToDataUrl, captureVideoFrame } from '../image-utils';

// ----------------------------------------------------------------------
// W-4. Visual Search Page — client-side AI (TensorFlow.js + MobileNet) with
// live camera capture or photo upload. The reference photo is carried to the
// product page so it can be attached to the order (admin sees it later).
// ----------------------------------------------------------------------

type Phase = 'choose' | 'camera' | 'processing' | 'results' | 'no-match' | 'error';

const CONFIDENCE_FLOOR = 0.08;

export function StoreVisualSearchView() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>('choose');
  const [preview, setPreview] = useState('');
  const [topLabel, setTopLabel] = useState('');
  const [matches, setMatches] = useState<Product[]>([]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Stop the camera if we leave the page or change phase away from 'camera'.
  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = useCallback(async () => {
    setPhase('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      stopCamera();
      setPhase('error');
    }
  }, [stopCamera]);

  const analyze = useCallback(async (image: HTMLImageElement, dataUrl: string) => {
    setPreview(dataUrl);
    setPhase('processing');
    try {
      const predictions: Prediction[] = await classifyImage(image);
      const best = predictions[0];
      if (!best || best.score < CONFIDENCE_FLOOR) {
        setPhase('no-match');
        return;
      }
      // Match against available (visible + not out-of-stock) materials.
      const products = await fetchVisibleProducts();
      const available = products.filter((p) => getStockStatus(p) !== 'out_of_stock');
      const matched = matchProductsByLabels(predictions, available);
      setTopLabel(best.label);
      if (matched.length === 0) {
        setPhase('no-match');
        return;
      }
      setMatches(matched);
      setPhase('results');
    } catch {
      setPhase('error');
    }
  }, []);

  const handleFile = useCallback(
    async (file?: File | null) => {
      if (!file) return;
      const img = await fileToImage(file);
      await analyze(img, imageToDataUrl(img));
    },
    [analyze]
  );

  const handleCapture = useCallback(async () => {
    if (!videoRef.current) return;
    const { dataUrl, image } = await captureVideoFrame(videoRef.current);
    stopCamera();
    await analyze(image, dataUrl);
  }, [analyze, stopCamera]);

  const handleSelect = (product: Product) => {
    setVisualRef({ productId: product.id, photo: preview });
    router.push(`/product/${product.id}`);
  };

  const reset = () => {
    stopCamera();
    setPreview('');
    setMatches([]);
    setTopLabel('');
    setPhase('choose');
  };

  return (
    <Box>
      <Typography variant="h4">Find It With a Photo</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
        Don&apos;t know the name of a part? Take a photo or upload one and we&apos;ll match it to
        items in our shop.
      </Typography>

      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Choose: camera or upload */}
      {phase === 'choose' && (
        <Card
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          sx={{
            p: 6,
            textAlign: 'center',
            border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
          }}
        >
          <Iconify icon="solar:camera-add-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Search with Camera
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Point at the item, or drop an image here.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:camera-bold" />}
              onClick={startCamera}
              data-tour="vs-camera"
            >
              Open Camera
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:upload-bold" />}
              onClick={() => inputRef.current?.click()}
              data-tour="vs-upload"
            >
              Upload Photo
            </Button>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 2 }}>
            JPG or PNG · Clear, well-lit photos work best.
          </Typography>
        </Card>
      )}

      {/* Live camera */}
      {phase === 'camera' && (
        <Card sx={{ p: 2, textAlign: 'center' }}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'common.black',
              aspectRatio: '4/3',
            }}
          >
            <Box
              component="video"
              ref={videoRef}
              playsInline
              muted
              sx={{ width: 1, height: 1, objectFit: 'cover' }}
            />
            <IconButton
              onClick={reset}
              sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(0,0,0,0.4)', color: 'common.white' }}
            >
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', my: 2 }}>
            Tap the button to search
          </Typography>
          <IconButton
            onClick={handleCapture}
            sx={{
              width: 72,
              height: 72,
              border: (theme) => `4px solid ${theme.vars.palette.primary.main}`,
            }}
          >
            <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: 'primary.main' }} />
          </IconButton>
        </Card>
      )}

      {/* Processing */}
      {phase === 'processing' && (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          {preview && (
            <Box
              component="img"
              src={preview}
              sx={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 2, mb: 3 }}
            />
          )}
          <Typography variant="h6">Analyzing your image…</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Running on your device — this may take a moment.
          </Typography>
          <LinearProgress sx={{ maxWidth: 280, mx: 'auto' }} />
        </Card>
      )}

      {/* Results */}
      {phase === 'results' && (
        <Box>
          <Card sx={{ p: 2.5, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            {preview && (
              <Box
                component="img"
                src={preview}
                sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1.5 }}
              />
            )}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                We think this is related to:
              </Typography>
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {topLabel}
              </Typography>
            </Box>
            <Button color="inherit" onClick={reset} startIcon={<Iconify icon="solar:restart-bold" />}>
              New search
            </Button>
          </Card>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Here are matching items from our shop:
          </Typography>
          <Grid container spacing={3}>
            {matches.map((product) => (
              <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <Card sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box
                    component="img"
                    src={product.images[0]}
                    alt={product.name}
                    sx={{ width: 1, aspectRatio: '4/3', objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Starts at {fPeso(product.basePrice)}
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ mt: 1.5 }}
                      onClick={() => handleSelect(product)}
                    >
                      Use This &amp; Size
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* No match / error */}
      {(phase === 'no-match' || phase === 'error') && (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Iconify
            icon="solar:magnifer-zoom-out-bold-duotone"
            width={56}
            sx={{ color: 'text.disabled' }}
          />
          <Typography variant="h6" sx={{ mt: 1 }}>
            {phase === 'error'
              ? "Couldn't analyze that image right now."
              : "We couldn't confidently match that photo to our stock."}
          </Typography>
          <Box sx={{ mt: 2, mb: 1, textAlign: 'left', maxWidth: 360, mx: 'auto' }}>
            <Suggestion text="Try a clearer photo with the item centered." onClick={reset} />
            <Suggestion text="Browse by category instead →" href="/catalog" />
            <Suggestion text="Contact the shop for help identifying this part →" href="/contact" />
          </Box>
          <Button variant="contained" onClick={reset} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Card>
      )}

      <Typography
        variant="caption"
        sx={{ color: 'text.disabled', display: 'block', mt: 4, textAlign: 'center' }}
      >
        Visual search identifies the general category of an item and links it to our inventory. For
        an exact match, our team can confirm the specific product.
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

function Suggestion({ text, href, onClick }: { text: string; href?: string; onClick?: () => void }) {
  if (href) {
    return (
      <Link component={RouterLink} href={href} variant="body2" sx={{ display: 'block', py: 0.5 }}>
        {text}
      </Link>
    );
  }
  return (
    <Link component="button" variant="body2" onClick={onClick} sx={{ display: 'block', py: 0.5 }}>
      {text}
    </Link>
  );
}
