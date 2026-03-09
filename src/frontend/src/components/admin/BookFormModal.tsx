import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { type Book, BookCategory } from "../../backend";
import { useAddBook, useUpdateBook } from "../../hooks/useQueries";

interface BookFormModalProps {
  open: boolean;
  onClose: () => void;
  editBook?: Book | null;
}

const CATEGORIES = [
  { value: BookCategory.Journals, label: "Journals" },
  { value: BookCategory.ProfessionalBooks, label: "Professional Books" },
  { value: BookCategory.BareActs, label: "Bare Acts" },
  { value: BookCategory.AcademicBooks, label: "Academic Books" },
];

const defaultForm = {
  title: "",
  author: "",
  publisher: "",
  yearPublished: "",
  numPages: "",
  description: "",
  coverImageUrl: "",
  category: BookCategory.Journals as BookCategory,
  originalPriceINR: "",
  discountPercent: "0",
  stockAvailable: "",
};

export default function BookFormModal({
  open,
  onClose,
  editBook,
}: BookFormModalProps) {
  const addBookMutation = useAddBook();
  const updateBookMutation = useUpdateBook();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editBook) {
      setForm({
        title: editBook.title,
        author: editBook.author ?? "",
        publisher: editBook.publisher ?? "",
        yearPublished: editBook.yearPublished
          ? String(Number(editBook.yearPublished))
          : "",
        numPages: editBook.numPages ? String(Number(editBook.numPages)) : "",
        description: editBook.description,
        coverImageUrl: editBook.coverImageUrl,
        category: editBook.category,
        originalPriceINR: String(Number(editBook.originalPriceINR)),
        discountPercent: String(Number(editBook.discountPercent)),
        stockAvailable: String(Number(editBook.stockAvailable)),
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [editBook]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.author.trim()) newErrors.author = "Author is required";
    if (!form.publisher.trim()) newErrors.publisher = "Publisher is required";
    if (
      !form.originalPriceINR ||
      Number.isNaN(Number(form.originalPriceINR)) ||
      Number(form.originalPriceINR) < 0
    ) {
      newErrors.originalPriceINR = "Valid price is required";
    }
    if (
      Number.isNaN(Number(form.discountPercent)) ||
      Number(form.discountPercent) < 0 ||
      Number(form.discountPercent) > 100
    ) {
      newErrors.discountPercent = "Discount must be 0–100";
    }
    if (
      !form.stockAvailable ||
      Number.isNaN(Number(form.stockAvailable)) ||
      Number(form.stockAvailable) < 0
    ) {
      newErrors.stockAvailable = "Valid stock quantity is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editBook) {
        await updateBookMutation.mutateAsync({
          ...editBook,
          title: form.title.trim(),
          author: form.author.trim(),
          publisher: form.publisher.trim(),
          yearPublished: BigInt(form.yearPublished || "0"),
          numPages: BigInt(form.numPages || "0"),
          description: form.description.trim(),
          coverImageUrl: form.coverImageUrl.trim(),
          category: form.category,
          originalPriceINR: BigInt(Math.round(Number(form.originalPriceINR))),
          discountPercent: BigInt(Math.round(Number(form.discountPercent))),
          finalPriceINR: BigInt(0), // recalculated by backend
          stockAvailable: BigInt(Math.round(Number(form.stockAvailable))),
        });
      } else {
        await addBookMutation.mutateAsync({
          title: form.title.trim(),
          author: form.author.trim(),
          publisher: form.publisher.trim(),
          yearPublished: BigInt(form.yearPublished || "0"),
          numPages: BigInt(form.numPages || "0"),
          description: form.description.trim(),
          coverImageUrl: form.coverImageUrl.trim(),
          category: form.category,
          originalPriceINR: BigInt(Math.round(Number(form.originalPriceINR))),
          discountPercent: BigInt(Math.round(Number(form.discountPercent))),
          stockAvailable: BigInt(Math.round(Number(form.stockAvailable))),
        });
      }
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save book";
      setErrors({ general: message });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const isPending = addBookMutation.isPending || updateBookMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {editBook ? "Edit Book" : "Add New Book"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Book title"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-destructive text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Author & Publisher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="Author name"
                className={errors.author ? "border-destructive" : ""}
              />
              {errors.author && (
                <p className="text-destructive text-xs mt-1">{errors.author}</p>
              )}
            </div>
            <div>
              <Label htmlFor="publisher">Publisher *</Label>
              <Input
                id="publisher"
                name="publisher"
                value={form.publisher}
                onChange={handleChange}
                placeholder="Publisher name"
                className={errors.publisher ? "border-destructive" : ""}
              />
              {errors.publisher && (
                <p className="text-destructive text-xs mt-1">
                  {errors.publisher}
                </p>
              )}
            </div>
          </div>

          {/* Year & Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="yearPublished">Year of Publication</Label>
              <Input
                id="yearPublished"
                name="yearPublished"
                type="number"
                value={form.yearPublished}
                onChange={handleChange}
                placeholder="e.g. 2023"
                min="1800"
                max="2100"
              />
            </div>
            <div>
              <Label htmlFor="numPages">Number of Pages</Label>
              <Input
                id="numPages"
                name="numPages"
                type="number"
                value={form.numPages}
                onChange={handleChange}
                placeholder="e.g. 350"
                min="1"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label>Category *</Label>
            <Select
              value={form.category}
              onValueChange={(val) =>
                setForm((prev) => ({ ...prev, category: val as BookCategory }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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

          {/* Price & Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="originalPriceINR">Price in INR (₹) *</Label>
              <Input
                id="originalPriceINR"
                name="originalPriceINR"
                type="number"
                value={form.originalPriceINR}
                onChange={handleChange}
                placeholder="e.g. 599"
                min="0"
                className={errors.originalPriceINR ? "border-destructive" : ""}
              />
              {errors.originalPriceINR && (
                <p className="text-destructive text-xs mt-1">
                  {errors.originalPriceINR}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="discountPercent">Discount (%)</Label>
              <Input
                id="discountPercent"
                name="discountPercent"
                type="number"
                value={form.discountPercent}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="100"
                className={errors.discountPercent ? "border-destructive" : ""}
              />
              {errors.discountPercent && (
                <p className="text-destructive text-xs mt-1">
                  {errors.discountPercent}
                </p>
              )}
            </div>
          </div>

          {/* Stock */}
          <div>
            <Label htmlFor="stockAvailable">Stock Available *</Label>
            <Input
              id="stockAvailable"
              name="stockAvailable"
              type="number"
              value={form.stockAvailable}
              onChange={handleChange}
              placeholder="e.g. 50"
              min="0"
              className={errors.stockAvailable ? "border-destructive" : ""}
            />
            {errors.stockAvailable && (
              <p className="text-destructive text-xs mt-1">
                {errors.stockAvailable}
              </p>
            )}
          </div>

          {/* Cover Image URL */}
          <div>
            <Label htmlFor="coverImageUrl">Cover Image URL</Label>
            <Input
              id="coverImageUrl"
              name="coverImageUrl"
              value={form.coverImageUrl}
              onChange={handleChange}
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Book description..."
              rows={3}
            />
          </div>

          {errors.general && (
            <p className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              {errors.general}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editBook ? (
                "Update Book"
              ) : (
                "Add Book"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
