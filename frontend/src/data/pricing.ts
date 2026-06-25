// ----------------------------------------------------------------------
// Dynamic price formula (Objective 3) — matches the manuscript's pricing model:
//
//   unit = P_base + (W × H × 1.5) + ((W + H) × 2)
//   i.e. unit = P_base + (W × H) × surfaceMultiplier + (W + H) × perimeterMultiplier
//
// Surface area (W × H) drives material cost; (W + H) × multiplier covers the
// framing/labour. Defaults: surface 1.5, perimeter 2 (the manuscript constants).
// ----------------------------------------------------------------------

export const DEFAULT_SURFACE_MULTIPLIER = 1.5;
export const DEFAULT_PERIMETER_MULTIPLIER = 2;

export type PriceBreakdown = {
  base: number;
  surface: number;
  perimeter: number;
  unit: number;
};

type ComputeArgs = {
  base: number;
  width: number;
  height: number;
  surfaceMultiplier?: number;
  perimeterMultiplier?: number;
};

export function computeUnitPrice({
  base,
  width,
  height,
  surfaceMultiplier = DEFAULT_SURFACE_MULTIPLIER,
  perimeterMultiplier = DEFAULT_PERIMETER_MULTIPLIER,
}: ComputeArgs): PriceBreakdown {
  const surface = width * height * surfaceMultiplier;
  const perimeter = (width + height) * perimeterMultiplier;
  const unit = base + surface + perimeter;

  return {
    base: round(base),
    surface: round(surface),
    perimeter: round(perimeter),
    unit: round(unit),
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

// Philippine peso formatter (₱).
const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function fPeso(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '₱0';
  return pesoFormatter.format(value);
}
