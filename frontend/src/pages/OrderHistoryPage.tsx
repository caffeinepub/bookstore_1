import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Package, Calendar, BookOpen, LogIn, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetOrdersByBuyer } from '../hooks/useQueries';
import type { BookOrder } from '../backend';

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed': return 'bg-accent/15 text-accent';
    case 'cancelled': return 'bg-destructive/15 text-destructive';
    default: return 'bg-secondary text-muted-foreground';
  }
}

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: orders = [], isLoading } = useGetOrdersByBuyer();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const sortedOrders = [...orders].sort((a, b) => {
    return Number(b.createdAt - a.createdAt);
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-2xl font-semibold mb-3">Login to View Orders</h2>
          <p className="text-muted-foreground mb-8">
            Please log in to see your order history.
          </p>
          <Button onClick={login} disabled={isLoggingIn} size="lg" className="gap-2">
            <LogIn className="w-5 h-5" />
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold mb-8">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5">
              <div className="flex justify-between mb-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-8 max-w-sm">
            You haven't placed any orders yet. Browse our catalog to find your next great read!
          </p>
          <Button onClick={() => navigate({ to: '/' })} className="gap-2">
            <BookOpen className="w-4 h-4" />
            Browse Catalog
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order: BookOrder) => (
            <div
              key={order.orderId}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-xs transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Order #{order.orderId}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-lg">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{order.items.length}</span>{' '}
                {order.items.length === 1 ? 'item' : 'items'} ordered
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
