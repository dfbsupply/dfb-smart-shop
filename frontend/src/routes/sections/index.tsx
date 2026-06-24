import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';

import { authRoutes } from './auth';
import { adminRoutes } from './admin';
import { buyerRoutes } from './buyer';
import { storeRoutes } from './store';
import { Page404, renderFallback } from './shared';

const RiderTrackPage = lazy(() => import('src/pages/track'));

// ----------------------------------------------------------------------
// All application routes, grouped by interface:
//   store  → public webshop          (/, /catalog, /product/:id, …)
//   admin  → owner back-office        (/admin, /admin/orders, …)
//   buyer  → client account app      (/buyer, /buyer/orders, …)
//   auth   → sign-in / register / reset (/login, /login/register, /login/admin, …)
// ----------------------------------------------------------------------

export const routesSection: RouteObject[] = [
  // Rider live-tracking page — standalone (no store/buyer chrome).
  {
    path: 'track/:orderId',
    element: (
      <Suspense fallback={renderFallback()}>
        <RiderTrackPage />
      </Suspense>
    ),
  },
  ...storeRoutes,
  ...adminRoutes,
  ...buyerRoutes,
  ...authRoutes,
  { path: '404', element: <Page404 /> },
  { path: '*', element: <Page404 /> },
];
