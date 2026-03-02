import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Book } from '../backend';

export interface CartItem {
  book: Book;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: bigint;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bookstore_cart';

function serializeCart(items: CartItem[]): string {
  return JSON.stringify(items.map(item => ({
    book: {
      ...item.book,
      id: item.book.id,
      finalPrice: item.book.finalPrice.toString(),
      originalPrice: item.book.originalPrice.toString(),
      discountPercent: item.book.discountPercent.toString(),
      stockAvailable: item.book.stockAvailable.toString(),
    },
    quantity: item.quantity,
  })));
}

function deserializeCart(data: string): CartItem[] {
  try {
    const parsed = JSON.parse(data);
    return parsed.map((item: any) => ({
      book: {
        ...item.book,
        finalPrice: BigInt(item.book.finalPrice),
        originalPrice: BigInt(item.book.originalPrice),
        discountPercent: BigInt(item.book.discountPercent),
        stockAvailable: BigInt(item.book.stockAvailable),
      },
      quantity: item.quantity,
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = sessionStorage.getItem(CART_STORAGE_KEY);
      return stored ? deserializeCart(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(CART_STORAGE_KEY, serializeCart(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = useCallback((book: Book) => {
    setItems(prev => {
      const existing = prev.find(item => item.book.id === book.id);
      if (existing) {
        return prev.map(item =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { book, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((bookId: number) => {
    setItems(prev => prev.filter(item => item.book.id !== bookId));
  }, []);

  const updateQuantity = useCallback((bookId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.book.id !== bookId));
    } else {
      setItems(prev =>
        prev.map(item =>
          item.book.id === bookId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      sessionStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.book.finalPrice * BigInt(item.quantity),
    BigInt(0)
  );

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
