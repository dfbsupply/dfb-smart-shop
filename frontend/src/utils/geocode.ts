// ----------------------------------------------------------------------
// Geocoding via OpenStreetMap Nominatim (free, no API key). Biased to the
// Philippines. Best-effort: returns null on any failure. Low volume only
// (one lookup per order view) per Nominatim's usage policy.
// ----------------------------------------------------------------------

export type LatLng = { lat: number; lng: number };

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const q = address?.trim();
  if (!q) return null;
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ph&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(data) || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}
