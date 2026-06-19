import { Navigate } from 'react-router-dom';

import { renderFallback } from 'src/routes/sections/shared';

import { useAuth } from './auth-provider';

// ----------------------------------------------------------------------
// Route guards. RequireAuth protects the buyer area; RequireAdmin protects
// the owner back-office. While the session (or admin status) is still being
// resolved we show the suspense fallback rather than redirecting, to avoid a
// flash/bounce right after sign-in.
// ----------------------------------------------------------------------

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, session } = useAuth();

  if (loading) return renderFallback();
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { loading, session, isAdmin, metaUserId } = useAuth();

  if (loading) return renderFallback();
  if (!session) return <Navigate to="/login/admin" replace />;
  // Admin status for the current user not resolved yet — keep waiting.
  if (metaUserId !== session.user.id) return renderFallback();
  if (!isAdmin) return <Navigate to="/login/admin" replace />;
  return <>{children}</>;
}
