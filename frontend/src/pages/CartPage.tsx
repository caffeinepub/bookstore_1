import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, BookOpen, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '../context/CartContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalAmount } = useCart();
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-2xl font-semibold mb-3">Sign in to view your cart</h2>
          <p className="text-muted-foreground mb-8">
            Please log in to access your shopping cart and place orders.
          </p>
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
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-2xl font-semibold mb-3">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Browse our catalog and add some books to your cart.
          </p>
          <Button onClick={() => navigate({ to: '/' })} size="lg" className="gap-2">
            <BookOpen className="w-5 h-5" />
            Browse Catalog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ book, quantity }) => (
            <div key={book.id} className="bg-card rounded-xl border border-border p-4 flex gap-4">
              <img
                src={book.coverImageUrl || '/assets/generated/book-placeholder.dim_300x420.png'}
                alt={book.title}
                className="w-16 h-22 object-cover rounded-md shrink-0"
                style={{ height: '88px' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/generated/book-placeholder.dim_300x420.png';
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-semibold text-base leading-snug mb-0.5 truncate">
                  {book.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
                <div className="flex items-center justify-between">
                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(book.id, quantity - 1)}
                      className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(book.id, quantity + 1)}
                      disabled={quantity >= Number(book.stockAvailable)}
                      className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatPrice(book.finalPrice * BigInt(quantity))}
                    </span>
                    <button
                      onClick={() => removeFromCart(book.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
            <h2 className="font-serif text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map(({ book, quantity }) => (
                <div key={book.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">
                    {book.title} × {quantity}
                  </span>
                  <span className="shrink-0">{formatPrice(book.finalPrice * BigInt(quantity))}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-semibold text-lg mb-6">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => navigate({ to: '/checkout' })}
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-muted-foreground"
              onClick={() => navigate({ to: '/' })}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
