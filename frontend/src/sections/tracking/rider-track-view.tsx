import type { RiderLoc } from 'src/services/tracking';

import { useParams } from 'react-router-dom';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { createRiderBroadcaster } from 'src/services/tracking';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { LiveTrackMap } from 'src/components/live-track-map';

// ----------------------------------------------------------------------
// Rider tracking page (/track/:orderId). The delivery rider opens this on
// their phone and taps "Start sharing" — the browser's GPS streams their
// position to the customer's order map via Supabase Realtime. A "simulate"
// toggle animates a moving rider for demos without a second device.
// ----------------------------------------------------------------------

const SIM_START: RiderLoc = { lat: 14.5826, lng: 121.0939, at: 0 }; // Pasig area

export function RiderTrackView() {
  const { orderId } = useParams();
  const [sharing, setSharing] = useState(false);
  const [simulate, setSimulate] = useState(false);
  const [pos, setPos] = useState<RiderLoc | null>(null);
  const [error, setError] = useState('');
  const [backgrounded, setBackgrounded] = useState(false);

  const broadcaster = useRef<ReturnType<typeof createRiderBroadcaster> | null>(null);
  const watchId = useRef<number | null>(null);
  const simTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeat = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPos = useRef<RiderLoc | null>(null);
  const wakeLock = useRef<{ release?: () => void } | null>(null);

  const acquireWake = useCallback(async () => {
    try {
      const wl = (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release?: () => void }> } }).wakeLock;
      if (wl) wakeLock.current = await wl.request('screen');
    } catch {
      /* wake lock unsupported / denied — non-fatal */
    }
  }, []);

  const releaseWake = useCallback(() => {
    try {
      wakeLock.current?.release?.();
    } catch {
      /* ignore */
    }
    wakeLock.current = null;
  }, []);

  const push = useCallback((loc: RiderLoc) => {
    setPos(loc);
    lastPos.current = loc;
    broadcaster.current?.send(loc);
  }, []);

  const stop = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (simTimer.current) {
      clearInterval(simTimer.current);
      simTimer.current = null;
    }
    if (heartbeat.current) {
      clearInterval(heartbeat.current);
      heartbeat.current = null;
    }
    releaseWake();
    broadcaster.current?.stop();
    broadcaster.current = null;
    setSharing(false);
  }, [releaseWake]);

  const start = useCallback(() => {
    if (!orderId) return;
    setError('');
    broadcaster.current = createRiderBroadcaster(orderId);
    setSharing(true);
    acquireWake(); // keep the screen on while sharing

    if (simulate) {
      // Animate a rider drifting NE so the customer sees the pin move.
      let cur: RiderLoc = { ...SIM_START, at: Date.now() };
      push(cur);
      simTimer.current = setInterval(() => {
        cur = { lat: cur.lat + 0.0006, lng: cur.lng + 0.0004, at: Date.now() };
        push(cur);
      }, 2000);
      return;
    }

    if (!('geolocation' in navigator)) {
      setError('This device does not support location.');
      setSharing(false);
      return;
    }
    watchId.current = navigator.geolocation.watchPosition(
      (p) => push({ lat: p.coords.latitude, lng: p.coords.longitude, at: Date.now() }),
      (e) => {
        setError(e.code === e.PERMISSION_DENIED ? 'Location permission denied.' : 'Could not get your location.');
        stop();
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
    // Heartbeat: keep re-sending the last fix so a stationary-but-connected
    // rider still reads as "Live" and late-joining customers get the position.
    heartbeat.current = setInterval(() => {
      const lp = lastPos.current;
      if (lp) broadcaster.current?.send({ lat: lp.lat, lng: lp.lng, at: Date.now() });
    }, 6000);
  }, [orderId, simulate, push, stop, acquireWake]);

  // Warn when the page is backgrounded (GPS/realtime pause there); auto re-lock
  // the screen on return.
  useEffect(() => {
    const onVis = () => {
      setBackgrounded(document.hidden);
      if (!document.hidden && sharing) acquireWake();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [sharing, acquireWake]);

  // Clean up on unmount.
  useEffect(() => () => stop(), [stop]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Logo />
        <Box>
          <Typography variant="h6">Rider Tracking</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Order {orderId ? `#${orderId.slice(0, 8)}…` : ''}
          </Typography>
        </Box>
      </Box>

      <Card sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              size="small"
              color={sharing ? 'success' : 'default'}
              label={sharing ? 'Sharing location' : 'Not sharing'}
              icon={<Iconify icon={sharing ? 'solar:gps-bold' : 'solar:gps-broken'} width={16} />}
            />
            {pos && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
              </Typography>
            )}
          </Box>

          <LiveTrackMap rider={pos} height={300} />

          {error && <Alert severity="error">{error}</Alert>}

          {sharing && backgrounded && (
            <Alert severity="warning" icon={<Iconify icon="solar:eye-closed-bold" />}>
              Tracking is paused while this screen is in the background. Keep this page open and the
              screen on so the customer can see you move.
            </Alert>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={simulate}
                disabled={sharing}
                onChange={(e) => setSimulate(e.target.checked)}
              />
            }
            label="Simulate movement (demo, no real GPS)"
          />

          {!sharing ? (
            <Button
              size="large"
              variant="contained"
              startIcon={<Iconify icon="solar:map-arrow-up-bold" />}
              onClick={start}
            >
              {simulate ? 'Start simulated delivery' : 'Start sharing my location'}
            </Button>
          ) : (
            <Button size="large" variant="outlined" color="error" onClick={stop}>
              Stop sharing
            </Button>
          )}

          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Keep this page open while delivering. The customer sees your live location on their order
            page. Tracking stops when you close this page or tap Stop.
          </Typography>
        </Stack>
      </Card>
    </Container>
  );
}
