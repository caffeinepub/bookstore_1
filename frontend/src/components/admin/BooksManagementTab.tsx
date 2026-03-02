import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import BookFormModal from './BookFormModal';
import { useGetAllBooks, useDeleteBook } from '../../hooks/useQueries';
import type { Book } from '../../backend';

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

export default function BooksManagementTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  const { data: books = [], isLoading } = useGetAllBooks();
  const deleteBook = useDeleteBook();

  const handleEdit = (book: Book) => {
    setEditBook(book);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditBook(null);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBook.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-semibold">Books Management</h2>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Book
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No books yet. Add your first book!</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Author</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Category</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Stock</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map(book => (
                <TableRow key={book.id} className="hover:bg-secondary/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{book.title}</p>
                      {book.discountPercent > 0n && (
                        <Badge variant="secondary" className="text-xs mt-0.5">
                          -{Number(book.discountPercent)}%
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {book.author}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs">{book.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <span className="font-medium">{formatPrice(book.finalPrice)}</span>
                      {book.discountPercent > 0n && (
                        <span className="text-xs text-muted-foreground line-through ml-1">
                          {formatPrice(book.originalPrice)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm hidden sm:table-cell">
                    <span className={Number(book.stockAvailable) === 0 ? 'text-destructive' : 'text-muted-foreground'}>
                      {Number(book.stockAvailable)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(book)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(book)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <BookFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditBook(null); }}
        editBook={editBook}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBook.isPending}
            >
              {deleteBook.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
              ) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
