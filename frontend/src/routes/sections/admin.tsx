import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { DashboardLayout } from 'src/layouts/dashboard';

import { renderFallback } from './shared';

// ----------------------------------------------------------------------
// Admin (owner back-office) routes — A-2 to A-10, under /admin.
// (Admin sign-in lives in the shared auth routes — see auth.tsx.)
// ----------------------------------------------------------------------

const DashboardPage = lazy(() => import('src/pages/admin/dashboard'));
const OrdersPage = lazy(() => import('src/pages/admin/orders'));
const OrderDetailPage = lazy(() => import('src/pages/admin/order-detail'));
const InventoryPage = lazy(() => import('src/pages/admin/inventory'));
const ProductFormPage = lazy(() => import('src/pages/admin/product-form'));
const PromosPage = lazy(() => import('src/pages/admin/promos'));
const RecommendationsPage = lazy(() => import('src/pages/admin/recommendations'));
const ReportsPage = lazy(() => import('src/pages/admin/reports'));
const SettingsPage = lazy(() => import('src/pages/admin/settings'));

export const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    element: (
      <DashboardLayout>
        <Suspense fallback={renderFallback()}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:id', element: <OrderDetailPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'inventory/new', element: <ProductFormPage /> },
      { path: 'inventory/:id/edit', element: <ProductFormPage /> },
      { path: 'promos', element: <PromosPage /> },
      { path: 'recommendations', element: <RecommendationsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
];
