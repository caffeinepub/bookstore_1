import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetBook } from '../hooks/useQueries';
import { BookCategory } from '../backend';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, ArrowLeft, BookOpen, Minus, Plus, Tag, Building2, Calendar, FileText, User } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  [BookCategory.Journals]: 'Journals',
  [BookCategory.ProfessionalBooks]: 'Professional Books',
  [BookCategory.BareActs]: 'Bare Acts',
  [BookCategory.AcademicBooks]: 'Academic Books',
};

export default function BookDetailPage() {
  const { bookId } = useParams({ from: '/layout/book/$bookId' });
  const navigate = useNavigate();
  const { data: book, isLoading, error } = useGetBook(Number(bookId));
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-[3/4] rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <p className="text-destructive text-lg">Book not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate({ to: '/' })}>
          Back to Catalog
        </Button>
      </div>
    );
  }

  const originalPrice = Number(book.originalPriceINR);
  const finalPrice = Number(book.finalPriceINR);
  const discount = Number(book.discountPercent);
  const stock = Number(book.stockAvailable);
  const categoryLabel = categoryLabels[book.category as string] ?? String(book.category);

  const handleAddToCart = () => {
    if (stock > 0) {
      addItem({
        bookId: book.id,
        title: book.title,
        finalPriceINR: finalPrice,
        quantity,
        coverImageUrl: book.coverImageUrl,
        maxStock: stock,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 text-muted-foreground hover:text-foreground"
        onClick={() => navigate({ to: '/' })}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Catalog
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Cover Image */}
        <div className="relative">
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted shadow-book">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-muted-foreground/30" />
              </div>
            )}
          </div>
          {discount > 0 && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-accent text-accent-foreground font-bold text-sm px-3 py-1">
                {discount}% OFF
              </Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <Badge variant="outline" className="w-fit mb-3 text-muted-foreground">
            {categoryLabel}
          </Badge>

          <h1 className="font-serif text-3xl font-bold text-foreground mb-2 leading-tight">
            {book.title}
          </h1>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-secondary/20 rounded-lg border border-border">
            {book.author && (
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Author</p>
                  <p className="text-sm font-medium text-foreground">{book.author}</p>
                </div>
              </div>
            )}
            {book.publisher && (
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Publisher</p>
                  <p className="text-sm font-medium text-foreground">{book.publisher}</p>
                </div>
              </div>
            )}
            {book.yearPublished && Number(book.yearPublished) > 0 && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Year Published</p>
                  <p className="text-sm font-medium text-foreground">{Number(book.yearPublished)}</p>
                </div>
              </div>
            )}
            {book.numPages && Number(book.numPages) > 0 && (
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Pages</p>
                  <p className="text-sm font-medium text-foreground">{Number(book.numPages)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-primary">
              {formatINR(finalPrice)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatINR(originalPrice)}
                </span>
                <span className="text-sm text-accent font-semibold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Save {formatINR(originalPrice - finalPrice)}
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="mb-4">
            {stock > 0 ? (
              <span className="text-sm text-green-600 font-medium">
                ✓ In Stock ({stock} available)
              </span>
            ) : (
              <span className="text-sm text-destructive font-medium">✗ Out of Stock</span>
            )}
          </div>

          {/* Description */}
          {book.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{book.description}</p>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          {stock > 0 && (
            <div className="flex items-center gap-4 mt-auto">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  className="px-3 py-2 hover:bg-secondary transition-colors"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button
                  className="px-3 py-2 hover:bg-secondary transition-colors"
                  onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button className="flex-1" size="lg" onClick={handleAddToCart}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
