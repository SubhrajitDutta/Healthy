import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Dish } from '../types';
import { computeCartTotals } from '../utils/calc';

interface AddToCartOptions {
  removedIngredientIds?: string[];
  swappedIngredientIds?: string[];
  portionGrams?: number;
  notes?: string;
  quantity?: number;
}

interface CartContextValue {
  items: CartItem[];
  shopId: string | null;
  addItem: (dish: Dish, opts?: AddToCartOptions) => { conflict: boolean };
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totals: ReturnType<typeof computeCartTotals>;
  itemCount: number;
  lastConflictDish: Dish | null;
  resolveConflict: (proceed: boolean) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'healthy-cart-v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<{ dish: Dish; opts?: AddToCartOptions } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setItems(JSON.parse(raw));
        } catch {
          // ignore corrupt cache
        }
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const shopId = items[0]?.dish.shopId ?? null;

  const addItem = useCallback(
    (dish: Dish, opts?: AddToCartOptions): { conflict: boolean } => {
      if (shopId && dish.shopId !== shopId && items.length > 0) {
        setPendingAdd({ dish, opts });
        return { conflict: true };
      }
      setItems((prev) => {
        const newItem: CartItem = {
          id: `${dish.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          dish,
          quantity: opts?.quantity ?? 1,
          removedIngredientIds: opts?.removedIngredientIds ?? [],
          swappedIngredientIds: opts?.swappedIngredientIds ?? [],
          portionGrams: opts?.portionGrams ?? dish.baseGrams,
          notes: opts?.notes,
        };
        return [...prev, newItem];
      });
      return { conflict: false };
    },
    [shopId, items.length]
  );

  const resolveConflict = useCallback(
    (proceed: boolean) => {
      if (proceed && pendingAdd) {
        const { dish, opts } = pendingAdd;
        setItems(() => [
          {
            id: `${dish.id}-${Date.now()}`,
            dish,
            quantity: opts?.quantity ?? 1,
            removedIngredientIds: opts?.removedIngredientIds ?? [],
            swappedIngredientIds: opts?.swappedIngredientIds ?? [],
            portionGrams: opts?.portionGrams ?? dish.baseGrams,
            notes: opts?.notes,
          },
        ]);
      }
      setPendingAdd(null);
    },
    [pendingAdd]
  );

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== cartItemId)
        : prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totals = useMemo(() => computeCartTotals(items), [items]);
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        shopId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totals,
        itemCount,
        lastConflictDish: pendingAdd?.dish ?? null,
        resolveConflict,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
