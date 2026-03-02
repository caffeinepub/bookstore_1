import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import BookCard from '../components/BookCard';
import { useGetAllBooks } from '../hooks/useQueries';

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const { data: books = [], isLoading } = useGetAllBooks();

  const categories = useMemo(() => {
    const cats = Array.from(new Set(books.map(b => b.category).filter(Boolean)));
    return cats.sort();
  }, [books]);

  const filtered = useMemo(() => {
    return books.filter(book => {
      const matchesSearch =
        !search ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || book.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src="/assets/generated/catalog-hero.dim_1200x400.png"
          alt="BookStore catalog"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/40 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary-foreground mb-2 drop-shadow-md">
            Our Book Collection
          </h1>
          <p className="text-primary-foreground/90 text-sm md:text-base max-w-lg drop-shadow">
            Discover handpicked books with exclusive community discounts
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 sm:w-52">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-6">
            {filtered.length} {filtered.length === 1 ? 'book' : 'books'} found
            {search && ` for "${search}"`}
            {category !== 'all' && ` in ${category}`}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="font-serif text-xl font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              {books.length === 0
                ? 'The catalog is empty. Check back soon for new arrivals!'
                : 'Try adjusting your search or filter to find what you\'re looking for.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
