import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';

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
};

export function LiveTrackMap({ rider, destination = null, height = 280 }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderRef = useRef<L.Marker | null>(null);
  const destRef = useRef<L.Marker | null>(null);

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
