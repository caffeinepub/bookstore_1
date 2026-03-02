import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ShoppingCart, Tag, BookOpen, Package, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetBook } from '../hooks/useQueries';
import { useCart } from '../context/CartContext';

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

export default function BookDetailPage() {
  const { id } = useParams({ from: '/layout/book/$id' });
  const navigate = useNavigate();
  const bookId = parseInt(id, 10);
  const { data: book, isLoading, isError } = useGetBook(bookId);
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);

  const cartItem = items.find(i => i.book.id === bookId);
  const hasDiscount = book && book.discountPercent > 0n;
  const discountAmount = book ? book.originalPrice - book.finalPrice : 0n;

  const handleAddToCart = () => {
    if (!book) return;
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-[3/4] rounded-xl max-w-sm" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <BookOpen className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-semibold mb-2">Book Not Found</h2>
        <p className="text-muted-foreground mb-6">This book doesn't exist or has been removed.</p>
        <Button onClick={() => navigate({ to: '/' })}>Back to Catalog</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/' })}
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Button>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Cover */}
        <div className="flex justify-center md:justify-start">
          <div className="relative max-w-xs w-full">
            <img
              src={book.coverImageUrl || '/assets/generated/book-placeholder.dim_300x420.png'}
              alt={book.title}
              className="w-full rounded-xl shadow-book object-cover aspect-[3/4]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/generated/book-placeholder.dim_300x420.png';
              }}
            />
            {hasDiscount && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-accent text-accent-foreground font-bold text-sm px-3 py-1">
                  -{Number(book.discountPercent)}% OFF
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent uppercase tracking-wide">
                {book.category}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-2">
              {book.title}
            </h1>
            <p className="text-lg text-muted-foreground">by {book.author}</p>
          </div>

          {/* Price breakdown */}
          <div className="bg-secondary rounded-xl p-5 space-y-2">
            <h3 className="font-serif text-base font-semibold mb-3">Price Details</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Original Price</span>
              <span className={hasDiscount ? 'line-through text-muted-foreground' : 'font-medium'}>
                {formatPrice(book.originalPrice)}
              </span>
            </div>
            {hasDiscount && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount ({Number(book.discountPercent)}%)</span>
                  <span className="text-accent font-medium">-{formatPrice(discountAmount)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-semibold">Final Price</span>
                  <span className="font-bold text-xl text-foreground">{formatPrice(book.finalPrice)}</span>
                </div>
              </>
            )}
            {!hasDiscount && (
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold">Price</span>
                <span className="font-bold text-xl">{formatPrice(book.finalPrice)}</span>
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-muted-foreground" />
            {book.stockAvailable > 0n ? (
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">{Number(book.stockAvailable)}</span> copies available
              </span>
            ) : (
              <span className="text-destructive font-medium">Out of stock</span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-2">About this Book</h3>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              {book.description || 'No description available.'}
            </p>
          </div>

          {/* Cart info */}
          {cartItem && (
            <div className="flex items-center gap-2 text-sm text-accent bg-accent/10 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4" />
              <span>{cartItem.quantity} copy in your cart</span>
            </div>
          )}

          {/* Add to Cart */}
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleAddToCart}
            disabled={book.stockAvailable === 0n}
          >
            {added ? (
              <><CheckCircle className="w-5 h-5" /> Added to Cart!</>
            ) : (
              <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
