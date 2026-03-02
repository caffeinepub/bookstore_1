import React from 'react';
import { Link } from '@tanstack/react-router';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderConfirmationPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-6" />
      <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
        Order Confirmed!
      </h1>
      <p className="text-muted-foreground text-lg mb-8">
        Your order has been placed successfully. You can track your order status in your order history.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link to="/orders">View My Orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
