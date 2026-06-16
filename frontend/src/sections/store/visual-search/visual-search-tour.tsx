import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Step-by-step onboarding tour for the visual search modal. Auto-runs on
// the first visit, and can be replayed on demand from the modal's help button.
// Each step optionally spotlights an element marked with `data-tour="<id>"`.
// ----------------------------------------------------------------------

const TOUR_KEY = 'dfb-visual-search-tour-v1';

type Step = {
  target?: string;
  titleKey: string;
  bodyKey: string;
};

const STEPS: Step[] = [
  { titleKey: 'tour.welcomeTitle', bodyKey: 'tour.welcomeBody' },
  { target: 'capture', titleKey: 'tour.captureTitle', bodyKey: 'tour.captureBody' },
  { target: 'album', titleKey: 'tour.albumTitle', bodyKey: 'tour.albumBody' },
  { target: 'replay', titleKey: 'tour.replayTitle', bodyKey: 'tour.replayBody' },
];

export function hasSeenTour() {
  try {
    return localStorage.getItem(TOUR_KEY) === '1';
  } catch {
    return false;
  }
}

function markTourSeen() {
  try {
    localStorage.setItem(TOUR_KEY, '1');
  } catch {
    /* ignore storage failures (private mode, etc.) */
  }
}

export function VisualSearchTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Restart from the top whenever the tour is (re)opened.
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  // Measure the spotlighted element for the current step.
  useEffect(() => {
    if (!open) return undefined;

    const measure = () => {
      const el = current.target
        ? document.querySelector(`[data-tour="${current.target}"]`)
        : null;
      setRect(el ? el.getBoundingClientRect() : null);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open, current]);

  const finish = useCallback(() => {
    markTourSeen();
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: (theme) => theme.zIndex.modal + 2 }}>
      {/* Click blocker / dim backdrop (used when no element is spotlighted) */}
      <Box sx={{ position: 'absolute', inset: 0, bgcolor: rect ? 'transparent' : 'rgba(0,0,0,0.72)' }} />

      {/* Spotlight ring — the huge box-shadow dims everything except the cut-out */}
      {rect && (
        <Box
          sx={{
            position: 'absolute',
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'primary.main',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Instruction card, anchored to the bottom for stable placement */}
      <Card
        sx={{
          position: 'absolute',
          left: '50%',
          bottom: 32,
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 380,
          p: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Iconify icon="solar:camera-bold-duotone" width={22} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1">{t(current.titleKey)}</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {t('tour.step', { current: step + 1, total: STEPS.length })}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {t(current.bodyKey)}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button size="small" color="inherit" onClick={finish}>
            {t('tour.skip')}
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          {step > 0 && (
            <Button size="small" color="inherit" onClick={() => setStep((s) => s - 1)}>
              {t('tour.back')}
            </Button>
          )}
          <Button
            size="small"
            variant="contained"
            onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
          >
            {isLast ? t('tour.gotIt') : t('tour.next')}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
