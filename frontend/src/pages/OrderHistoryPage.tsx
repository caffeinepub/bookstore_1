import React, { useState } from 'react';
import { useGetOrdersByBuyer } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { OrderStatus } from '../backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import {
  Package,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
} from 'lucide-react';

function getStatusBadge(status: OrderStatus) {
  const icon: React.ReactNode =
    status === OrderStatus.success ? (
      <CheckCircle2 className="w-3 h-3" />
    ) : status === OrderStatus.inProgress ? (
      <Loader2 className="w-3 h-3 animate-spin" />
    ) : (
      <Clock className="w-3 h-3" />
    );

  const label =
    status === OrderStatus.success
      ? 'Delivered'
      : status === OrderStatus.inProgress
      ? 'In Progress'
      : 'Pending';

  const variant =
    status === OrderStatus.success
      ? 'default'
      : status === OrderStatus.inProgress
      ? 'secondary'
      : 'outline';

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      {icon}
      {label}
    </Badge>
  );
}

function formatINR(amount: number | bigint) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function formatDate(timestamp: bigint) {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function OrderHistoryPage() {
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading } = useGetOrdersByBuyer();
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  const toggleExpand = (orderId: number) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  if (!identity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6">Please log in to view your order history.</p>
        <Button asChild>
          <Link to="/">Go to Catalog</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">No Orders Yet</h2>
        <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
        <Button asChild>
          <Link to="/">Browse Catalog</Link>
        </Button>
      </div>
    );
  }

  const sortedOrders = [...orders].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-foreground mb-8">My Orders</h1>
      <div className="space-y-4">
        {sortedOrders.map(order => {
          const isExpanded = expandedOrders.has(order.orderId);
          return (
            <div
              key={order.orderId}
              className="bg-card border border-border rounded-lg overflow-hidden shadow-sm"
            >
              {/* Order Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
                onClick={() => toggleExpand(order.orderId)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      Order #{order.orderId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">
                    {formatINR(order.totalAmountINR)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-border p-4 space-y-4">
                  {/* Items */}
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-2">Items Ordered</h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Book #{item.bookId} × {Number(item.quantity)}
                          </span>
                          <span className="font-medium text-foreground">
                            {formatINR(Number(item.priceAtPurchaseINR) * Number(item.quantity))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-2">Delivery Details</h4>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-start gap-2">
                        <Building2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">{order.deliveryInfo.companyName}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">{order.deliveryInfo.companyAddress}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">{order.deliveryInfo.contactNumber}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">{order.deliveryInfo.email}</span>
                      </div>
                      {order.deliveryInfo.comments && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                          <span className="text-foreground">{order.deliveryInfo.comments}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
