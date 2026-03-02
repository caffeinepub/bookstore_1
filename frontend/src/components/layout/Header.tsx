import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, BookOpen, Menu, X, User, LogOut, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../../context/CartContext';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Catalog' },
    ...(isAuthenticated ? [{ to: '/orders', label: 'My Orders' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Panel' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/assets/generated/bookstore-logo.dim_200x200.png"
              alt="BookStore"
              className="w-9 h-9 rounded-md object-cover"
            />
            <span className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              BookStore
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeProps={{ className: 'px-3 py-2 rounded-md text-sm font-medium text-foreground bg-secondary' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-md hover:bg-secondary transition-colors">
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs rounded-full bg-primary text-primary-foreground">
                  {totalItems > 9 ? '9+' : totalItems}
                </Badge>
              )}
            </Link>

            {/* User info */}
            {isAuthenticated && userProfile && (
              <span className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                {userProfile.name}
              </span>
            )}

            {/* Auth button */}
            <Button
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="hidden md:flex gap-1.5"
            >
              {isLoggingIn ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Logging in...</>
              ) : isAuthenticated ? (
                <><LogOut className="w-3.5 h-3.5" /> Logout</>
              ) : (
                'Login'
              )}
            </Button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label === 'Admin Panel' && <Shield className="w-4 h-4 mr-2" />}
                {link.label}
              </Link>
            ))}
            <Link
              to="/cart"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <ShoppingCart className="w-4 h-4" />
              Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
            {isAuthenticated && userProfile && (
              <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                {userProfile.name}
              </div>
            )}
            <div className="px-3 pt-1">
              <Button
                variant={isAuthenticated ? 'outline' : 'default'}
                size="sm"
                onClick={handleAuth}
                disabled={isLoggingIn}
                className="w-full gap-1.5"
              >
                {isLoggingIn ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Logging in...</>
                ) : isAuthenticated ? (
                  <><LogOut className="w-3.5 h-3.5" /> Logout</>
                ) : (
                  'Login'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
