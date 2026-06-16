import { useMemo, useState, useContext, useCallback, createContext } from 'react';

// ----------------------------------------------------------------------
// Webshop cart — shared across product detail, cart, and checkout pages.
// Persisted to localStorage so it survives refreshes. Carries the computed
// (dynamic) unit price per line so checkout writes the same numbers the
// customer saw (Objective 3).
// ----------------------------------------------------------------------

export type CartItem = {
  id: string; // unique cart-line id
  productId: string;
  name: string;
  image: string;
  basePrice: number;
  width: number;
  height: number;
  qty: number;
  unitPrice: number;
  source?: 'manual' | 'visual_search';
  referencePhoto?: string; // data URL of the photo the customer searched with
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'dfb-cart';

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStorage);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    writeStorage(next);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, 'id'>) => {
      persist([...readStorage(), { ...item, id: `c${Date.now()}${Math.random().toString(36).slice(2, 6)}` }]);
    },
    [persist]
  );

  const removeItem = useCallback(
    (id: string) => persist(readStorage().filter((i) => i.id !== id)),
    [persist]
  );

  const updateQty = useCallback(
    (id: string, qty: number) =>
      persist(readStorage().map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))),
    [persist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = Math.round(items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0) * 100) / 100;
    return { items, count, subtotal, addItem, removeItem, updateQty, clear };
  }, [items, addItem, removeItem, updateQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
