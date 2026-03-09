import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import React from "react";
import ProfileSetupModal from "./components/auth/ProfileSetupModal";
import Layout from "./components/layout/Layout";
import { CartProvider } from "./context/CartContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import AdminPanelPage from "./pages/AdminPanelPage";
import BookDetailPage from "./pages/BookDetailPage";
import CartPage from "./pages/CartPage";
import CatalogPage from "./pages/CatalogPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Root wrapper: handles profile setup modal
function RootWrapper() {
  const { identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <Outlet />
      <ProfileSetupModal open={showProfileSetup} />
    </>
  );
}

// Routes
const rootRoute = createRootRoute({
  component: RootWrapper,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: CatalogPage,
});

const bookDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/book/$bookId",
  component: BookDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/cart",
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/checkout",
  component: CheckoutPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/orders",
  component: OrderHistoryPage,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/order-confirmation",
  component: OrderConfirmationPage,
});

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin",
  component: AdminPanelPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    bookDetailRoute,
    cartRoute,
    checkoutRoute,
    ordersRoute,
    orderConfirmationRoute,
    adminRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
