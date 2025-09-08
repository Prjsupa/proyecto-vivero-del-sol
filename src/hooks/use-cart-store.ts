
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

const calculateTotals = (items: CartItem[]) => {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    return { totalItems, totalPrice };
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




// This is a custom hook to ensure the store is hydrated before use on the client
const useCart = () => {
  // We use a dummy state to force re-render upon hydration
  const [_, setState] = React.useState({});
  
  // Zustand's persist middleware has a `onRehydrateStorage` callback and a `hasHydrated` function.
  // We can use these to know when the store is ready.
  React.useEffect(() => {
    // A function to be called when hydration is complete
    const onHydrate = () => setState({});
    
    // Subscribe to the hydration event
    useCartStore.persist.onFinishHydration(onHydrate);

    // Call it once in case hydration is already complete
    if (useCartStore.persist.hasHydrated()) {
      onHydrate();
    }
    
    return () => {
        // Here you might want to remove the listener if the store supports it, to prevent memory leaks.
        // Zustand's listeners are managed, so this is often not strictly necessary for simple cases.
    };
  }, []);
  
  // Return the store's state. It will be the initial state until hydration is complete.
  return useCartStore();
};


export default useCart;
