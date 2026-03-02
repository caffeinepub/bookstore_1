import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import type { Book } from '../backend';

interface BookCardProps {
  book: Book;
}

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

export default function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();
  const hasDiscount = book.discountPercent > 0n;

  return (
    <div
      className="group bg-card rounded-lg border border-border overflow-hidden cursor-pointer hover:shadow-book hover:-translate-y-1 transition-all duration-200"
      onClick={() => navigate({ to: '/book/$id', params: { id: String(book.id) } })}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <img
          src={book.coverImageUrl || '/assets/generated/book-placeholder.dim_300x420.png'}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/generated/book-placeholder.dim_300x420.png';
          }}
        />
        {hasDiscount && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-accent text-accent-foreground font-semibold text-xs px-2 py-0.5">
              -{Number(book.discountPercent)}%
            </Badge>
          </div>
        )}
        {book.stockAvailable === 0n && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground bg-card px-3 py-1 rounded-full border">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="mb-1">
          <span className="text-xs font-medium text-accent uppercase tracking-wide">
            {book.category}
          </span>
        </div>
        <h3 className="font-serif text-base font-semibold leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{book.author}</p>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{formatPrice(book.finalPrice)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(book.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
