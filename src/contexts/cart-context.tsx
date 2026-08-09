import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../data/catalog';

export type CartItem = Product & { quantity: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CART_KEY = 'lola.cart';
const CartContext = createContext<CartContextValue | null>(null);

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartItem[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
    addItem: (product) => {
      if (product.stock <= 0) return;
      setItems((current) => {
        const existing = current.find((item) => item.id === product.id);
        if (!existing) return [...current, { ...product, quantity: 1 }];
        if (existing.quantity >= product.stock) return current;
        return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      });
    },
    updateQuantity: (productId, quantity) => {
      setItems((current) => current.flatMap((item) => {
        if (item.id !== productId) return [item];
        if (quantity <= 0) return [];
        return [{ ...item, quantity: Math.min(quantity, item.stock) }];
      }));
    },
    removeItem: (productId) => setItems((current) => current.filter((item) => item.id !== productId)),
    clearCart: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé dans CartProvider.');
  }
  return context;
}
