import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { type Book, BookCategory } from "../../backend";
import { useDeleteBook, useGetAllBooks } from "../../hooks/useQueries";
import BookFormModal from "./BookFormModal";

const categoryLabels: Record<string, string> = {
  [BookCategory.Journals]: "Journals",
  [BookCategory.ProfessionalBooks]: "Professional Books",
  [BookCategory.BareActs]: "Bare Acts",
  [BookCategory.AcademicBooks]: "Academic Books",
};

const formatINR = (amount: number | bigint) =>
  `₹${Number(amount).toLocaleString("en-IN")}`;

export default function BooksManagementTab() {
  const { data: books, isLoading } = useGetAllBooks();
  const deleteBookMutation = useDeleteBook();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deleteBookId, setDeleteBookId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteBookId === null) return;
    try {
      await deleteBookMutation.mutateAsync(deleteBookId);
    } finally {
      setDeleteBookId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Books ({books?.length ?? 0})
        </h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Book
        </Button>
      </div>

      {!books || books.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No books found. Add your first book!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Publisher</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium max-w-[180px]">
                    <span className="line-clamp-2 text-sm">{book.title}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[120px]">
                    <span className="line-clamp-1">{book.author || "—"}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[120px]">
                    <span className="line-clamp-1">
                      {book.publisher || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs whitespace-nowrap"
                    >
                      {categoryLabels[book.category as string] ??
                        String(book.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatINR(book.originalPriceINR)}
                  </TableCell>
                  <TableCell>
                    {Number(book.discountPercent) > 0 ? (
                      <Badge className="bg-accent text-accent-foreground text-xs">
                        {Number(book.discountPercent)}%
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        Number(book.stockAvailable) === 0
                          ? "text-destructive font-medium text-sm"
                          : "text-foreground text-sm"
                      }
                    >
                      {Number(book.stockAvailable)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditBook(book)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteBookId(book.id)}
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

      {/* Add/Edit Modal */}
      <BookFormModal
        open={showAddModal || editBook !== null}
        onClose={() => {
          setShowAddModal(false);
          setEditBook(null);
        }}
        editBook={editBook}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteBookId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteBookId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this book? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBookMutation.isPending}
            >
              {deleteBookMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
