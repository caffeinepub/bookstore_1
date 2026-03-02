import React from 'react';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from './context/CartContext';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useActor } from './hooks/useActor';
import Layout from './components/layout/Layout';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import CatalogPage from './pages/CatalogPage';
import BookDetailPage from './pages/BookDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminPanelPage from './pages/AdminPanelPage';

// Profile guard wrapper
function AppWithProfileGuard() {
  const { identity } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !actorFetching && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <Outlet />
      <ProfileSetupModal open={showProfileSetup} />
    </>
  );
}

// Routes
const rootRoute = createRootRoute({
  component: () => (
    <CartProvider>
      <AppWithProfileGuard />
    </CartProvider>
  ),
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
});

const catalogRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: CatalogPage,
});

const bookDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/book/$id',
  component: BookDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/cart',
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/order-confirmation',
  component: OrderConfirmationPage,
});

const orderHistoryRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/orders',
  component: OrderHistoryPage,
});

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/admin',
  component: AdminPanelPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    catalogRoute,
    bookDetailRoute,
    cartRoute,
    checkoutRoute,
    orderConfirmationRoute,
    orderHistoryRoute,
    adminRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
