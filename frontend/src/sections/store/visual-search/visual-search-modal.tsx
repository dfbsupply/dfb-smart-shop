import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';

import { StoreProductCard } from '../product-card';
import { useImageSearch } from './use-image-search';
import { hasSeenTour, VisualSearchTour } from './visual-search-tour';

// ----------------------------------------------------------------------
// Shopee-style full-screen visual search. A live camera viewfinder + a
// "Search from Album" upload path feed the shared image search engine, with
// results shown inline. Works responsively for web and mobile web.
// ----------------------------------------------------------------------

export function VisualSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { phase, preview, topLabel, matches, runSearch, reset } = useImageSearch();

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraError(true);
    }
  }, []);

  // Run the camera only while the modal is open and waiting for a capture.
  useEffect(() => {
    if (open && phase === 'idle') {
      startCamera();
    } else {
      stopCamera();
    }
    return stopCamera;
  }, [open, phase, startCamera, stopCamera]);

  // Auto-launch the tour the first time a visitor opens visual search.
  useEffect(() => {
    if (open && !hasSeenTour()) setTourOpen(true);
  }, [open]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) runSearch(new File([blob], 'capture.jpg', { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92
    );
  }, [runSearch]);

  const handleClose = useCallback(() => {
    stopCamera();
    reset();
    setTourOpen(false);
    onClose();
  }, [stopCamera, reset, onClose]);

  // Back steps within the flow first (results → camera), then leaves visual
  // search entirely, returning the user to the page they came from.
  const handleBack = useCallback(() => {
    if (phase !== 'idle') {
      reset();
    } else {
      handleClose();
    }
  }, [phase, reset, handleClose]);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { bgcolor: 'common.black', color: 'common.white', display: 'flex', flexDirection: 'column' },
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          p: 1.5,
        }}
      >
        <IconButton onClick={handleBack} aria-label="Back" sx={{ color: 'common.white' }}>
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          data-tour="replay"
          onClick={() => setTourOpen(true)}
          sx={{ color: 'common.white' }}
        >
          <Iconify icon="solar:question-circle-bold" />
        </IconButton>
      </Box>

      {/* Capture mode: live camera + album upload */}
      {phase === 'idle' && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ position: 'relative', flexGrow: 1, overflow: 'hidden' }}>
            {!cameraError ? (
              <Box
                component="video"
                ref={videoRef}
                autoPlay
                playsInline
                muted
                sx={{ width: 1, height: 1, objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  height: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  px: 4,
                }}
              >
                <Iconify
                  icon="solar:camera-broken-bold-duotone"
                  width={56}
                  sx={{ color: 'grey.600' }}
                />
                <Typography variant="body2" sx={{ color: 'grey.400', mt: 1.5 }}>
                  {t('visualSearch.cameraUnavailable')}
                </Typography>
              </Box>
            )}

            {!cameraError && (
              <Box sx={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    mb: 2,
                    borderRadius: 5,
                    bgcolor: 'rgba(0,0,0,0.5)',
                  }}
                >
                  <Typography variant="body2">{t('visualSearch.tapToSearch')}</Typography>
                </Box>
                <Box>
                  <IconButton
                    data-tour="capture"
                    onClick={capture}
                    sx={{
                      p: 0,
                      width: 72,
                      height: 72,
                      border: '4px solid white',
                      bgcolor: 'rgba(255,255,255,0.25)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.4)' },
                    }}
                  >
                    <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: 'common.white' }} />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>

          {/* Search from Album */}
          <Box data-tour="album" sx={{ bgcolor: 'background.paper', color: 'text.primary', p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              {t('visualSearch.searchFromAlbum')}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Iconify icon="solar:gallery-add-bold" />}
              onClick={() => fileRef.current?.click()}
            >
              {t('visualSearch.choosePhoto')}
            </Button>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mt: 1.5, textAlign: 'center' }}
            >
              {t('visualSearch.albumHint')}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Processing */}
      {phase === 'processing' && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
          }}
        >
          {preview && (
            <Box
              component="img"
              src={preview}
              sx={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 2, mb: 3 }}
            />
          )}
          <Typography variant="h6">{t('visualSearch.analyzing')}</Typography>
          <Typography variant="body2" sx={{ color: 'grey.500', mb: 2 }}>
            {t('visualSearch.onDevice')}
          </Typography>
          <LinearProgress sx={{ width: 240 }} />
        </Box>
      )}

      {/* Results / no-match / error */}
      {(phase === 'results' || phase === 'no-match' || phase === 'error') && (
        <Box data-tour="results" sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.default', color: 'text.primary' }}>
          <Box sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'center' }}>
            {preview && (
              <Box
                component="img"
                src={preview}
                sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1.5 }}
              />
            )}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">{t('visualSearch.resultsTitle')}</Typography>
              {phase === 'results' && (
                <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                  {t('visualSearch.matchedTo', { label: topLabel })}
                </Typography>
              )}
            </Box>
            <Button
              color="inherit"
              onClick={reset}
              startIcon={<Iconify icon="solar:restart-bold" />}
            >
              {t('visualSearch.newSearch')}
            </Button>
          </Box>
          <Divider />

          {phase === 'results' ? (
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                {matches.map((product) => (
                  <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3 }}>
                    <StoreProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <Iconify
                icon="solar:magnifer-zoom-out-bold-duotone"
                width={56}
                sx={{ color: 'text.disabled' }}
              />
              <Typography variant="h6" sx={{ mt: 1 }}>
                {phase === 'error'
                  ? t('visualSearch.errorTitle')
                  : t('visualSearch.noMatchTitle')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                {t('visualSearch.tryClearer')}
              </Typography>
              <Button variant="contained" onClick={reset} sx={{ mt: 2 }}>
                {t('visualSearch.tryAnother')}
              </Button>
            </Box>
          )}
        </Box>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/png, image/jpeg"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) runSearch(file);
          e.target.value = '';
        }}
      />

      <VisualSearchTour open={tourOpen} onClose={() => setTourOpen(false)} />
    </Dialog>
  );
}
