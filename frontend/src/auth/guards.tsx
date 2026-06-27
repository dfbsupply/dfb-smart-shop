import { Navigate } from 'react-router-dom';

import { renderFallback } from 'src/routes/sections/shared';

import { useAuth } from './auth-provider';

// ----------------------------------------------------------------------
// Route guards — role-based access for the two signed-in panels.
//   RequireAuth  → buyer area (/buyer/**)
//   RequireAdmin → owner back-office (/admin/**)
//
// There is a single sign-in page (/login). After auth, a user belongs to
// exactly one panel based on their role, so each guard not only blocks the
// signed-out (→ /login) but also bounces a wrong-role user to *their* panel
// (admin in /buyer → /admin; buyer in /admin → /buyer). While the session or
// admin status is still resolving we show the suspense fallback rather than
// redirecting, to avoid a flash/bounce right after sign-in.
// ----------------------------------------------------------------------

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, session, isAdmin, metaUserId } = useAuth();

  if (loading) return renderFallback();
  if (!session) return <Navigate to="/login" replace />;
  // Role for the current user not resolved yet — keep waiting.
  if (metaUserId !== session.user.id) return renderFallback();
  // Admins belong in the back-office, not the buyer app.
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { loading, session, isAdmin, metaUserId } = useAuth();

  if (loading) return renderFallback();
  if (!session) return <Navigate to="/login" replace />;
  // Admin status for the current user not resolved yet — keep waiting.
  if (metaUserId !== session.user.id) return renderFallback();
  // A signed-in non-admin (buyer) belongs in the buyer app.
  if (!isAdmin) return <Navigate to="/buyer" replace />;
  return <>{children}</>;
}
