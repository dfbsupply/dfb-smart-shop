import { useMemo, useState, useContext, createContext } from 'react';

import { VisualSearchModal } from './visual-search-modal';

// ----------------------------------------------------------------------
// Provides a single, app-wide visual search modal that any storefront entry
// point (nav search camera, home shortcuts, etc.) can open.
// ----------------------------------------------------------------------

type VisualSearchContextValue = { open: () => void };

const VisualSearchContext = createContext<VisualSearchContextValue | null>(null);

export function VisualSearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(() => ({ open: () => setIsOpen(true) }), []);

  return (
    <VisualSearchContext.Provider value={value}>
      {children}
      <VisualSearchModal open={isOpen} onClose={() => setIsOpen(false)} />
    </VisualSearchContext.Provider>
  );
}

export function useVisualSearch() {
  const context = useContext(VisualSearchContext);
  if (!context) {
    throw new Error('useVisualSearch must be used within a VisualSearchProvider');
  }
  return context;
}
