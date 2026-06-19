import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { RequireAuth } from 'src/auth';
import { BuyerLayout } from 'src/layouts/buyer';

import { renderFallback } from './shared';

// ----------------------------------------------------------------------
// Buyer (client) mobile app routes — B-3 to B-8, under /buyer.
// (Buyer sign-in / register / password reset live in the shared auth
// routes — see auth.tsx.)
// ----------------------------------------------------------------------

const HomePage = lazy(() => import('src/pages/buyer/home'));
const OrdersPage = lazy(() => import('src/pages/buyer/orders'));
const OrderDetailPage = lazy(() => import('src/pages/buyer/order-detail'));
const ProfilePage = lazy(() => import('src/pages/buyer/profile'));
const NotificationsPage = lazy(() => import('src/pages/buyer/notifications'));

export const buyerRoutes: RouteObject[] = [
  {
    element: (
      <RequireAuth>
        <BuyerLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </BuyerLayout>
      </RequireAuth>
    ),
    children: [
      { path: 'buyer', element: <HomePage /> },
      { path: 'buyer/orders', element: <OrdersPage /> },
      { path: 'buyer/orders/:id', element: <OrderDetailPage /> },
      { path: 'buyer/notifications', element: <NotificationsPage /> },
      { path: 'buyer/profile', element: <ProfilePage /> },
    ],
  },
];
