import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import React from "react";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } =
    useCart();
  const navigate = useNavigate();

  const formatINR = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-6">
          Browse our catalog and add some books!
        </p>
        <Button asChild>
          <Link to="/">Browse Catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-foreground mb-8">
        Shopping Cart
        <span className="text-muted-foreground text-lg font-normal ml-3">
          ({totalItems} items)
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.bookId}
              className="flex gap-4 p-4 bg-card border border-border rounded-lg shadow-sm"
            >
              {/* Cover */}
              <div className="w-16 h-22 shrink-0 rounded overflow-hidden bg-muted">
                {item.coverImageUrl ? (
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-semibold text-foreground text-sm leading-snug mb-1 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-primary font-bold text-base">
                  {formatINR(item.finalPriceINR)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => removeItem(item.bookId)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center border border-border rounded overflow-hidden">
                  <button
                    type="button"
                    className="px-2 py-1 hover:bg-secondary transition-colors"
                    onClick={() =>
                      updateQuantity(item.bookId, item.quantity - 1)
                    }
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="px-2 py-1 hover:bg-secondary transition-colors"
                    onClick={() =>
                      updateQuantity(item.bookId, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.maxStock}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatINR(item.finalPriceINR * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
            <h2 className="font-serif text-xl font-bold text-foreground mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.bookId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="text-foreground font-medium shrink-0">
                    {formatINR(item.finalPriceINR * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatINR(totalPrice)}</span>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate({ to: "/checkout" })}
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
