
'use client';

import * as React from 'react';
import type { Product } from '@/lib/definitions';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      
      addItem: (product: Product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.product.id === product.id);

        let updatedItems;
        if (existingItem) {
          updatedItems = currentItems.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
              : item
          );
        } else {
          updatedItems = [...currentItems, { product, quantity: 1 }];
        }
        
        set(state => ({
            items: updatedItems,
            ...calculateTotals(updatedItems)
        }));
      },
      
      removeItem: (productId: string) => {
        const updatedItems = get().items.filter((item) => item.product.id !== productId);
        set(state => ({
            items: updatedItems,
            ...calculateTotals(updatedItems)
        }));
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        const productInCart = get().items.find(item => item.product.id === productId)?.product;
        if (!productInCart) return;

        const updatedItems = get().items.map((item) =>
            item.product.id === productId 
            ? { ...item, quantity: Math.max(0, Math.min(quantity, productInCart.stock)) } 
            : item
        ).filter(item => item.quantity > 0);

        set(state => ({
            items: updatedItems,
            ...calculateTotals(updatedItems)
        }));
      },
      
      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
          if (state) {
              const updatedItems = state.items.filter(item => item.product);
              state.items = updatedItems;
              Object.assign(state, calculateTotals(updatedItems));
          }
      }
    }
  )
);

const calculateTotals = (items: CartItem[]) => {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    return { totalItems, totalPrice };
};


// Initial hydration fix
const useCart = () => {
  const cart = useCartStore();
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated ? cart : { items: [], totalItems: 0, totalPrice: 0, addItem: () => {}, removeItem: () => {}, updateQuantity: () => {}, clearCart: () => {} };
};

export default useCart;
