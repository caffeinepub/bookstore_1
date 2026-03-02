import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useAddBook, useUpdateBook } from '../../hooks/useQueries';
import type { Book } from '../../backend';

interface BookFormModalProps {
  open: boolean;
  onClose: () => void;
  editBook?: Book | null;
}

interface FormData {
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  category: string;
  originalPrice: string;
  discountPercent: string;
  stockAvailable: string;
}

const emptyForm: FormData = {
  title: '',
  author: '',
  description: '',
  coverImageUrl: '',
  category: '',
  originalPrice: '',
  discountPercent: '0',
  stockAvailable: '',
};

export default function BookFormModal({ open, onClose, editBook }: BookFormModalProps) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const addBook = useAddBook();
  const updateBook = useUpdateBook();

  useEffect(() => {
    if (editBook) {
      setForm({
        title: editBook.title,
        author: editBook.author,
        description: editBook.description,
        coverImageUrl: editBook.coverImageUrl,
        category: editBook.category,
        originalPrice: String(Number(editBook.originalPrice)),
        discountPercent: String(Number(editBook.discountPercent)),
        stockAvailable: String(Number(editBook.stockAvailable)),
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [editBook, open]);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.title.trim()) newErrors.title = 'Required';
    if (!form.author.trim()) newErrors.author = 'Required';
    if (!form.category.trim()) newErrors.category = 'Required';
    if (!form.originalPrice || isNaN(Number(form.originalPrice)) || Number(form.originalPrice) < 0)
      newErrors.originalPrice = 'Valid price required';
    if (isNaN(Number(form.discountPercent)) || Number(form.discountPercent) < 0 || Number(form.discountPercent) > 100)
      newErrors.discountPercent = '0–100';
    if (!form.stockAvailable || isNaN(Number(form.stockAvailable)) || Number(form.stockAvailable) < 0)
      newErrors.stockAvailable = 'Valid stock required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editBook) {
        const finalPrice = BigInt(Math.round(Number(form.originalPrice))) -
          (BigInt(Math.round(Number(form.originalPrice))) * BigInt(Math.round(Number(form.discountPercent))) / 100n);
        await updateBook.mutateAsync({
          id: editBook.id,
          title: form.title.trim(),
          author: form.author.trim(),
          description: form.description.trim(),
          coverImageUrl: form.coverImageUrl.trim(),
          category: form.category.trim(),
          originalPrice: BigInt(Math.round(Number(form.originalPrice))),
          discountPercent: BigInt(Math.round(Number(form.discountPercent))),
          finalPrice,
          stockAvailable: BigInt(Math.round(Number(form.stockAvailable))),
        });
      } else {
        await addBook.mutateAsync({
          title: form.title.trim(),
          author: form.author.trim(),
          description: form.description.trim(),
          coverImageUrl: form.coverImageUrl.trim(),
          category: form.category.trim(),
          originalPrice: BigInt(Math.round(Number(form.originalPrice))),
          discountPercent: BigInt(Math.round(Number(form.discountPercent))),
          stockAvailable: BigInt(Math.round(Number(form.stockAvailable))),
        });
      }
      onClose();
    } catch {
      // error shown via mutation state
    }
  };

  const isPending = addBook.isPending || updateBook.isPending;
  const isError = addBook.isError || updateBook.isError;

  const field = (id: keyof FormData, label: string, placeholder: string, type = 'text') => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={form[id]}
        onChange={(e) => setForm(prev => ({ ...prev, [id]: e.target.value }))}
        className={errors[id] ? 'border-destructive' : ''}
      />
      {errors[id] && <p className="text-xs text-destructive">{errors[id]}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {editBook ? 'Edit Book' : 'Add New Book'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {field('title', 'Title *', 'Book title')}
          {field('author', 'Author *', 'Author name')}
          {field('category', 'Category *', 'e.g. Fiction, Science, History')}

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Book description..."
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {field('coverImageUrl', 'Cover Image URL', 'https://...')}

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="originalPrice">Price (cents) *</Label>
              <Input
                id="originalPrice"
                type="number"
                min="0"
                placeholder="e.g. 1299"
                value={form.originalPrice}
                onChange={(e) => setForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                className={errors.originalPrice ? 'border-destructive' : ''}
              />
              {errors.originalPrice && <p className="text-xs text-destructive">{errors.originalPrice}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discountPercent">Discount %</Label>
              <Input
                id="discountPercent"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={form.discountPercent}
                onChange={(e) => setForm(prev => ({ ...prev, discountPercent: e.target.value }))}
                className={errors.discountPercent ? 'border-destructive' : ''}
              />
              {errors.discountPercent && <p className="text-xs text-destructive">{errors.discountPercent}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stockAvailable">Stock *</Label>
              <Input
                id="stockAvailable"
                type="number"
                min="0"
                placeholder="e.g. 50"
                value={form.stockAvailable}
                onChange={(e) => setForm(prev => ({ ...prev, stockAvailable: e.target.value }))}
                className={errors.stockAvailable ? 'border-destructive' : ''}
              />
              {errors.stockAvailable && <p className="text-xs text-destructive">{errors.stockAvailable}</p>}
            </div>
          </div>

          {isError && (
            <p className="text-sm text-destructive">
              Failed to save book. Please try again.
            </p>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : editBook ? 'Update Book' : 'Add Book'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
