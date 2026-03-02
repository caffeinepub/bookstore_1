import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
  bookId: number;
  title: string;
  finalPriceINR: number;
  quantity: number;
  coverImageUrl: string;
  maxStock: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (bookId: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = 'gopal_book_agency_cart';

function serializeCart(items: CartItem[]): string {
  return JSON.stringify(items);
}

function deserializeCart(data: string): CartItem[] {
  try {
    return JSON.parse(data) as CartItem[];
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

  const addItem = useCallback((newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.bookId === newItem.bookId);
      if (existing) {
        return prev.map(i =>
          i.bookId === newItem.bookId
            ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, i.maxStock) }
            : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((bookId: number) => {
    setItems(prev => prev.filter(i => i.bookId !== bookId));
  }, []);

  const updateQuantity = useCallback((bookId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.bookId !== bookId));
    } else {
      setItems(prev =>
        prev.map(i =>
          i.bookId === bookId ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.finalPriceINR * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
