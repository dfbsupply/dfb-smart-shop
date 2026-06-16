// ----------------------------------------------------------------------
// Dynamic price formula (Objective 3)
//
//   unit = P_base + (W × H) × surfaceMultiplier + (2 × (W + H)) × perimeterMultiplier
//
// Surface area drives material cost; perimeter drives framing/labour. Both
// multipliers are configurable from Settings (A-10) so the constants are
// justifiable rather than hard-coded.
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
  const perimeter = 2 * (width + height) * perimeterMultiplier;
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
