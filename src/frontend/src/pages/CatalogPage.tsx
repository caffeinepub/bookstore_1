import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Search, SlidersHorizontal } from "lucide-react";
import React, { useState, useMemo } from "react";
import { BookCategory } from "../backend";
import BookCard from "../components/BookCard";
import { useGetAllBooks } from "../hooks/useQueries";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: BookCategory.Journals, label: "Journals" },
  { value: BookCategory.ProfessionalBooks, label: "Professional Books" },
  { value: BookCategory.BareActs, label: "Bare Acts" },
  { value: BookCategory.AcademicBooks, label: "Academic Books" },
];

export default function CatalogPage() {
  const { data: books, isLoading } = useGetAllBooks();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    return books.filter((book) => {
      const matchesSearch =
        !search ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        (book.category as string) === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, search, selectedCategory]);

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url(/assets/generated/catalog-hero.dim_1200x400.png)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/assets/generated/bookstore-logo.dim_200x200.png"
              alt="Gopal Book Agency"
              className="w-14 h-14 rounded-full object-cover border-2 border-primary-foreground/30"
            />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
            Gopal Book Agency
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Your trusted source for Journals, Professional Books, Bare Acts, and
            Academic Books
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mt-3">
            {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        )}
      </div>

      {/* Book Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => i).map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[3/4] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              No books found
            </h3>
            <p className="text-muted-foreground">
              {search || selectedCategory !== "all"
                ? "Try adjusting your search or filter."
                : "No books have been added yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
