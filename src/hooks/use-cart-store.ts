
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/lib/definitions';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.product.id === product.id);

        let updatedItems;
        if (existingItem) {
          updatedItems = items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedItems = [...items, { product, quantity }];
        }

        set({
          items: updatedItems,
          totalItems: get().totalItems + quantity,
          totalPrice: get().totalPrice + product.precio_venta * quantity,
        });
      },

      removeItem: (productId) => {
        const { items } = get();
        const itemToRemove = items.find((item) => item.product.id === productId);
        if (!itemToRemove) return;

        set({
          items: items.filter((item) => item.product.id !== productId),
          totalItems: get().totalItems - itemToRemove.quantity,
          totalPrice: get().totalPrice - itemToRemove.product.precio_venta * itemToRemove.quantity,
        });
      },

      updateQuantity: (productId, newQuantity) => {
        const { items } = get();
        const itemToUpdate = items.find((item) => item.product.id === productId);
        if (!itemToUpdate) return;

        const quantityDifference = newQuantity - itemToUpdate.quantity;

        set({
          items: items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: newQuantity }
              : item
          ),
          totalItems: get().totalItems + quantityDifference,
          totalPrice: get().totalPrice + itemToUpdate.product.precio_venta * quantityDifference,
        });
      },

      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
       onRehydrateStorage: () => (state) => {
        if (state) {
            const totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
            const totalPrice = state.items.reduce((acc, item) => acc + (item.product.precio_venta * item.quantity), 0);
            state.totalItems = totalItems;
            state.totalPrice = totalPrice;
        }
      }
    }
  )
);

export default useCartStore;
