// ----------------------------------------------------------------------
// Carries a visual-search result (the reference photo + which product the
// customer picked) from the Visual Search page to the Product Detail page,
// so the photo can be attached to the cart line and, ultimately, the order.
// Kept in sessionStorage so it survives the navigation.
// ----------------------------------------------------------------------

export type VisualSearchRef = {
  productId: string;
  photo: string; // data URL
};

const KEY = 'dfb-visual-ref';

export function setVisualRef(ref: VisualSearchRef): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ref));
  } catch {
    /* ignore */
  }
}

export function getVisualRef(): VisualSearchRef | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as VisualSearchRef) : null;
  } catch {
    return null;
  }
}

export function clearVisualRef(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
