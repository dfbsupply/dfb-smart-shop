import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { StoreLayout } from 'src/layouts/store';

import { renderFallback } from './shared';

// ----------------------------------------------------------------------
// Store (public webshop) routes — W-1 to W-9, mounted at the site root (/).
// ----------------------------------------------------------------------

const HomePage = lazy(() => import('src/pages/store/home'));
const CatalogPage = lazy(() => import('src/pages/store/catalog'));
const ProductPage = lazy(() => import('src/pages/store/product'));
const VisualSearchPage = lazy(() => import('src/pages/store/visual-search'));
const CartPage = lazy(() => import('src/pages/store/cart'));
const CheckoutPage = lazy(() => import('src/pages/store/checkout'));
const ConfirmationPage = lazy(() => import('src/pages/store/confirmation'));
const AboutPage = lazy(() => import('src/pages/store/about'));
const ContactPage = lazy(() => import('src/pages/store/contact'));

export const storeRoutes: RouteObject[] = [
  {
    element: (
      <StoreLayout>
        <Suspense fallback={renderFallback()}>
          <Outlet />
        </Suspense>
      </StoreLayout>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'product/:id', element: <ProductPage /> },
      { path: 'visual-search', element: <VisualSearchPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order-confirmed', element: <ConfirmationPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
    ],
  },
];
