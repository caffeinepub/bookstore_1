import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  DoorOpen,
  Loader2,
  LogIn,
  LogOut,
  Package,
  ShoppingCart,
} from "lucide-react";
import React from "react";
import { useCart } from "../../context/CartContext";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../../hooks/useQueries";

function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem("adminAuthenticated") === "true";
}

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { data: userProfile } = useGetCallerUserProfile();
  const routerState = useRouterState();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const isAdminPage = routerState.location.pathname === "/admin";
  const adminLoggedIn = isAdminPage && isAdminAuthenticated();

  const handleAdminExit = () => {
    sessionStorage.removeItem("adminAuthenticated");
    navigate({ to: "/" });
  };

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: "/" });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
            <img
              src="/assets/generated/bookstore-logo.dim_200x200.png"
              alt="Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <span className="font-serif font-bold text-lg text-foreground hidden sm:block">
            Gopal Book Agency
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/50 flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Catalog</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/orders"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/50 flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">My Orders</span>
            </Link>
          )}

          {/* Admin link hidden from UI — accessible directly via /admin URL */}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Cart */}
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* User info */}
          {isAuthenticated && userProfile && (
            <span className="text-sm text-muted-foreground hidden md:block max-w-[120px] truncate">
              {userProfile.name}
            </span>
          )}

          {/* Admin Exit / Login/Logout */}
          {adminLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdminExit}
              data-ocid="header.admin_exit.button"
            >
              <DoorOpen className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Exit Admin</span>
            </Button>
          ) : (
            <Button
              variant={isAuthenticated ? "outline" : "default"}
              size="sm"
              onClick={handleAuth}
              disabled={isLoggingIn}
              data-ocid="header.auth.button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  <span className="hidden sm:inline">Logging in...</span>
                </>
              ) : isAuthenticated ? (
                <>
                  <LogOut className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Logout</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Login</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
