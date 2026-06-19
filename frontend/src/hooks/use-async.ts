import { useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------
// Tiny data-fetching hook: runs an async function, tracks loading/error,
// and exposes refetch(). Re-runs when `deps` change. Used to back the admin
// views with live Supabase reads.
// ----------------------------------------------------------------------

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useAsync<T>(fn: () => Promise<T>, deps: React.DependencyList = []) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true }));
    fn()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (active)
          setState({ data: null, loading: false, error: err instanceof Error ? err.message : String(err) });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { ...state, refetch };
}
