import type { RouteObject } from 'react-router';

import { Page404 } from './shared';
import { authRoutes } from './auth';
import { adminRoutes } from './admin';
import { buyerRoutes } from './buyer';
import { storeRoutes } from './store';

// ----------------------------------------------------------------------
// All application routes, grouped by interface:
//   store  → public webshop          (/, /catalog, /product/:id, …)
//   admin  → owner back-office        (/admin, /admin/orders, …)
//   buyer  → client account app      (/buyer, /buyer/orders, …)
//   auth   → sign-in / register / reset (/login, /login/register, /login/admin, …)
// ----------------------------------------------------------------------

export const routesSection: RouteObject[] = [
  ...storeRoutes,
  ...adminRoutes,
  ...buyerRoutes,
  ...authRoutes,
  { path: '404', element: <Page404 /> },
  { path: '*', element: <Page404 /> },
];
