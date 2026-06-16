import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';

import { AuthLayout } from 'src/layouts/auth';
import { BuyerLayout } from 'src/layouts/buyer';

import { renderFallback } from './shared';

// ----------------------------------------------------------------------
// Auth routes — all sign-in / register / password-reset flows, consolidated
// under /login.
//   /login                       → buyer (customer) sign-in
//   /login/register              → buyer registration
//   /login/forgot-password       → buyer password reset
//   /login/admin                 → owner back-office sign-in
//   /login/admin/forgot-password → owner password reset
// ----------------------------------------------------------------------

const AdminSignInPage = lazy(() => import('src/pages/auth/admin-sign-in'));
const AdminForgotPasswordPage = lazy(() => import('src/pages/auth/admin-forgot-password'));
const BuyerSignInPage = lazy(() => import('src/pages/auth/buyer-sign-in'));
const BuyerRegisterPage = lazy(() => import('src/pages/auth/buyer-register'));
const BuyerForgotPasswordPage = lazy(() => import('src/pages/auth/buyer-forgot-password'));

const adminAuth = (element: React.ReactNode) => (
  <AuthLayout>
    <Suspense fallback={renderFallback()}>{element}</Suspense>
  </AuthLayout>
);

const buyerAuth = (element: React.ReactNode) => (
  <BuyerLayout hideBottomNav>
    <Suspense fallback={renderFallback()}>{element}</Suspense>
  </BuyerLayout>
);

export const authRoutes: RouteObject[] = [
  // Buyer / customer
  { path: 'login', element: buyerAuth(<BuyerSignInPage />) },
  { path: 'login/register', element: buyerAuth(<BuyerRegisterPage />) },
  { path: 'login/forgot-password', element: buyerAuth(<BuyerForgotPasswordPage />) },
  // Admin / staff
  { path: 'login/admin', element: adminAuth(<AdminSignInPage />) },
  { path: 'login/admin/forgot-password', element: adminAuth(<AdminForgotPasswordPage />) },
];
