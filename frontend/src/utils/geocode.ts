// ----------------------------------------------------------------------
// Geocoding via OpenStreetMap Nominatim (free, no API key). Biased to the
// Philippines. Messy PH street addresses often don't resolve, so we fall back
// to progressively coarser queries (drop house no./street → barangay → city).
// Best-effort: returns null on total failure. Low volume only (one lookup per
// order view) per Nominatim's usage policy.
// ----------------------------------------------------------------------

export type LatLng = { lat: number; lng: number };

async function geocodeOnce(query: string): Promise<LatLng | null> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ph&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(data) || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const raw = address?.trim();
  if (!raw) return null;

  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);

  // Candidates: full address, then drop leading segments (house no./street),
  // and the coarse locality tail. First hit wins.
  const candidates = new Set<string>();
  candidates.add(raw);
  if (parts.length > 1) candidates.add(parts.slice(1).join(', '));
  if (parts.length > 2) candidates.add(parts.slice(-3).join(', '));
  if (parts.length > 1) candidates.add(parts.slice(-2).join(', '));

  for (const c of candidates) {
     
    const hit = await geocodeOnce(`${c}, Philippines`);
    if (hit) return hit;
     
    await new Promise((r) => setTimeout(r, 500)); // be polite to Nominatim
  }
  return null;
}
