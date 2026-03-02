import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, ShoppingBag, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCart } from '../context/CartContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { usePlaceOrder, useGetCallerUserProfile } from '../hooks/useQueries';
import type { OrderItem } from '../backend';

const ORDER_CONFIRMATION_KEY = 'bookstore_order_confirmation';

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const placeOrder = usePlaceOrder();

  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({});

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Pre-fill from profile
  useEffect(() => {
    if (userProfile) {
      if (!buyerName) setBuyerName(userProfile.name);
      if (!buyerContact) setBuyerContact(userProfile.contact);
    }
  }, [userProfile]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-2xl font-semibold mb-3">Login Required</h2>
          <p className="text-muted-foreground mb-8">Please log in to complete your purchase.</p>
          <Button onClick={login} disabled={isLoggingIn} size="lg" className="gap-2">
            <LogIn className="w-5 h-5" />
            {isLoggingIn ? 'Logging in...' : 'Login to Continue'}
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl font-semibold mb-3">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some books before checking out.</p>
        <Button onClick={() => navigate({ to: '/' })}>Browse Catalog</Button>
      </div>
    );
  }

  const validate = () => {
    const newErrors: { name?: string; contact?: string } = {};
    if (!buyerName.trim()) newErrors.name = 'Name is required';
    if (!buyerContact.trim()) newErrors.contact = 'Contact is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;

    const orderItems: OrderItem[] = items.map(({ book, quantity }) => ({
      bookId: book.id,
      quantity: BigInt(quantity),
      priceAtPurchase: book.finalPrice,
    }));

    try {
      await placeOrder.mutateAsync({
        buyerName: buyerName.trim(),
        buyerContact: buyerContact.trim(),
        items: orderItems,
      });

      // Store confirmation data in sessionStorage to pass to confirmation page
      const confirmationData = {
        buyerName: buyerName.trim(),
        buyerContact: buyerContact.trim(),
        items: items.map(({ book, quantity }) => ({
          title: book.title,
          author: book.author,
          quantity,
          price: Number(book.finalPrice),
        })),
        totalAmount: Number(totalAmount),
        timestamp: Date.now(),
      };

      try {
        sessionStorage.setItem(ORDER_CONFIRMATION_KEY, JSON.stringify(confirmationData));
      } catch {
        // ignore storage errors
      }

      clearCart();
      navigate({ to: '/order-confirmation' });
    } catch {
      // error shown via placeOrder.isError
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/cart' })}
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Button>

      <h1 className="font-serif text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Buyer Details */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-serif text-xl font-semibold mb-5">Your Details</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact">Contact (email or phone) *</Label>
                <Input
                  id="contact"
                  placeholder="your@email.com or +1234567890"
                  value={buyerContact}
                  onChange={(e) => setBuyerContact(e.target.value)}
                  className={errors.contact ? 'border-destructive' : ''}
                />
                {errors.contact && <p className="text-xs text-destructive">{errors.contact}</p>}
              </div>
            </div>
          </div>

          {placeOrder.isError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
              Failed to place order. Please try again.
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-serif text-xl font-semibold mb-5">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map(({ book, quantity }) => (
                <div key={book.id} className="flex gap-3">
                  <img
                    src={book.coverImageUrl || '/assets/generated/book-placeholder.dim_300x420.png'}
                    alt={book.title}
                    className="w-10 h-14 object-cover rounded shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/generated/book-placeholder.dim_300x420.png';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{book.title}</p>
                    <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                  </div>
                  <span className="text-sm font-medium shrink-0">
                    {formatPrice(book.finalPrice * BigInt(quantity))}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handlePlaceOrder}
              disabled={placeOrder.isPending}
            >
              {placeOrder.isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
              ) : (
                <><ShoppingBag className="w-5 h-5" /> Place Order</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
