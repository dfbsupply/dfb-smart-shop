import type { LatLng } from './geocode';

// ----------------------------------------------------------------------
// Road routing via OSRM's public demo server (free, no API key). Returns the
// route geometry (road-following) from `from` to `to`, or null on failure so
// the caller can fall back to a straight line. Demo-grade (no SLA).
// ----------------------------------------------------------------------

export type Route = { points: LatLng[]; distanceM: number; durationS: number };

export async function fetchRoute(from: LatLng, to: LatLng): Promise<Route | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      routes?: { geometry?: { coordinates?: [number, number][] }; distance?: number; duration?: number }[];
    };
    const route = data.routes?.[0];
    const coords = route?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length === 0) return null;
    return {
      points: coords.map(([lng, lat]) => ({ lat, lng })),
      distanceM: route?.distance ?? 0,
      durationS: route?.duration ?? 0,
    };
  } catch {
    return null;
  }
}
