import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';

import { fetchRoute } from 'src/utils/route';

// ----------------------------------------------------------------------
// Interactive map (Leaflet + OpenStreetMap, no API key) with a live-updating
// rider pin and an optional destination pin. Used for real-time delivery
// tracking. Markers are HTML divIcons so no image assets are needed.
// ----------------------------------------------------------------------

type LatLng = { lat: number; lng: number };

const DEFAULT_CENTER: [number, number] = [14.5826, 121.0939]; // Metro Manila

const riderIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:26px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">🛵</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const destIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:26px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">📍</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 28],
});

type Props = {
  rider: LatLng | null;
  destination?: LatLng | null;
  height?: number | string;
  onEta?: (info: { distanceM: number; durationS: number }) => void;
};

export function LiveTrackMap({ rider, destination = null, height = 280, onEta }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderRef = useRef<L.Marker | null>(null);
  const destRef = useRef<L.Marker | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const lastRouteFrom = useRef<LatLng | null>(null);
  const lastDest = useRef<LatLng | null>(null);

  // Init map once.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return undefined;
    const map = L.map(elRef.current, { center: DEFAULT_CENTER, zoom: 12, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    // Container is sized by CSS; make sure Leaflet measures it.
    setTimeout(() => map.invalidateSize(), 0);
    return () => {
      map.remove();
      mapRef.current = null;
      riderRef.current = null;
      destRef.current = null;
    };
  }, []);

  // Destination pin.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (destination) {
      if (!destRef.current) {
        destRef.current = L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(map);
      } else {
        destRef.current.setLatLng([destination.lat, destination.lng]);
      }
      // Center on the destination until the rider's pin arrives.
      if (!riderRef.current) map.setView([destination.lat, destination.lng], 14);
    } else if (destRef.current) {
      destRef.current.remove();
      destRef.current = null;
    }
  }, [destination]);

  // Live rider pin — moves as new positions arrive.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !rider) return;
    if (!riderRef.current) {
      riderRef.current = L.marker([rider.lat, rider.lng], { icon: riderIcon }).addTo(map);
    } else {
      riderRef.current.setLatLng([rider.lat, rider.lng]);
    }
    // Keep both rider + destination in view; otherwise center on the rider.
    if (destRef.current) {
      map.fitBounds(
        L.latLngBounds([rider.lat, rider.lng], [destRef.current.getLatLng().lat, destRef.current.getLatLng().lng]).pad(0.4)
      );
    } else {
      map.setView([rider.lat, rider.lng], 15);
    }
  }, [rider]);

  // Route line rider → destination: real road path (OSRM) with a straight-line
  // fallback. Re-routes when the rider moves enough or the destination changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    if (!rider || !destination) {
      if (routeRef.current) {
        routeRef.current.remove();
        routeRef.current = null;
      }
      lastRouteFrom.current = null;
      lastDest.current = null;
      return undefined;
    }

    const draw = (latlngs: [number, number][], dashed: boolean) => {
      if (!routeRef.current) {
        routeRef.current = L.polyline(latlngs, {
          color: '#1877F2',
          weight: 4,
          opacity: dashed ? 0.45 : 0.85,
          dashArray: dashed ? '6,8' : undefined,
        }).addTo(map);
      } else {
        routeRef.current.setLatLngs(latlngs);
        routeRef.current.setStyle({ opacity: dashed ? 0.45 : 0.85, dashArray: dashed ? '6,8' : undefined });
      }
    };

    const lf = lastRouteFrom.current;
    const ld = lastDest.current;
    const moved = !lf || Math.hypot(lf.lat - rider.lat, lf.lng - rider.lng) > 0.0003; // ~30 m
    const destChanged = !ld || ld.lat !== destination.lat || ld.lng !== destination.lng;
    if (!moved && !destChanged) return undefined;
    lastRouteFrom.current = rider;
    lastDest.current = destination;

    // Show a straight line immediately, then upgrade to the road route.
    draw([[rider.lat, rider.lng], [destination.lat, destination.lng]], true);

    let active = true;
    fetchRoute(rider, destination).then((route) => {
      if (!active || !route) return;
      draw(route.points.map((p) => [p.lat, p.lng] as [number, number]), false);
      onEta?.({ distanceM: route.distanceM, durationS: route.durationS });
    });
    return () => {
      active = false;
    };
  }, [rider, destination, onEta]);

  return (
    <Box
      ref={elRef}
      sx={{
        width: 1,
        height,
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: 'background.neutral',
        '& .leaflet-container': { height: '100%', width: '100%', fontFamily: 'inherit' },
      }}
    />
  );
}
