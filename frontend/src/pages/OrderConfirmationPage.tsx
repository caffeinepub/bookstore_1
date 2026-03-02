import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle, BookOpen, Calendar, User, Phone, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const ORDER_CONFIRMATION_KEY = 'bookstore_order_confirmation';

interface ConfirmationItem {
  title: string;
  author: string;
  quantity: number;
  price: number;
}

interface ConfirmationOrder {
  buyerName: string;
  buyerContact: string;
  items: ConfirmationItem[];
  totalAmount: number;
  timestamp: number;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<ConfirmationOrder | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(ORDER_CONFIRMATION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ConfirmationOrder;
        setOrder(parsed);
        // Clear after reading so it can't be revisited stale
        sessionStorage.removeItem(ORDER_CONFIRMATION_KEY);
      } else {
        navigate({ to: '/' });
      }
    } catch {
      navigate({ to: '/' });
    }
  }, [navigate]);

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-secondary px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(order.timestamp)}</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Buyer info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Buyer Name</p>
                  <p className="font-medium">{order.buyerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="font-medium">{order.buyerContact}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-serif text-lg font-semibold">Items Ordered</h3>
              </div>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.author} · Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium shrink-0 ml-4">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="font-serif text-xl font-semibold">Total Paid</span>
              <span className="font-bold text-2xl">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button
            size="lg"
            className="flex-1 gap-2"
            onClick={() => navigate({ to: '/' })}
          >
            <BookOpen className="w-5 h-5" />
            Continue Shopping
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate({ to: '/orders' })}
          >
            View Order History
          </Button>
        </div>
      </div>
    </div>
  );
}
