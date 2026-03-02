import React from 'react';
import { Link } from '@tanstack/react-router';
import { Book, BookCategory } from '../backend';
import { ShoppingCart, BookOpen } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BookCardProps {
  book: Book;
}

const categoryLabels: Record<string, string> = {
  [BookCategory.Journals]: 'Journals',
  [BookCategory.ProfessionalBooks]: 'Professional Books',
  [BookCategory.BareActs]: 'Bare Acts',
  [BookCategory.AcademicBooks]: 'Academic Books',
};

export default function BookCard({ book }: BookCardProps) {
  const { addItem } = useCart();

  const originalPrice = Number(book.originalPriceINR);
  const finalPrice = Number(book.finalPriceINR);
  const discount = Number(book.discountPercent);
  const stock = Number(book.stockAvailable);

  const formatINR = (amount: number) =>
    `₹${amount.toLocaleString('en-IN')}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stock > 0) {
      addItem({
        bookId: book.id,
        title: book.title,
        finalPriceINR: finalPrice,
        quantity: 1,
        coverImageUrl: book.coverImageUrl,
        maxStock: stock,
      });
    }
  };

  const categoryLabel = categoryLabels[book.category as string] ?? String(book.category);

  return (
    <Link to="/book/$bookId" params={{ bookId: String(book.id) }} className="block group">
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-book hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
        {/* Cover Image */}
        <div className="relative overflow-hidden bg-muted aspect-[3/4]">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/30">
              <BookOpen className="w-16 h-16 text-muted-foreground/40" />
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-accent text-accent-foreground font-semibold text-xs">
                {discount}% OFF
              </Badge>
            </div>
          )}
          {stock === 0 && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-destructive font-semibold text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="mb-1">
            <Badge variant="outline" className="text-xs text-muted-foreground border-border">
              {categoryLabel}
            </Badge>
          </div>
          <h3 className="font-serif font-semibold text-foreground text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          {book.author && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
              by {book.author}
            </p>
          )}

          <div className="mt-auto pt-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base font-bold text-primary">
                {formatINR(finalPrice)}
              </span>
              {discount > 0 && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatINR(originalPrice)}
                </span>
              )}
            </div>

            <Button
              size="sm"
              className="w-full"
              onClick={handleAddToCart}
              disabled={stock === 0}
              variant={stock === 0 ? 'outline' : 'default'}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
