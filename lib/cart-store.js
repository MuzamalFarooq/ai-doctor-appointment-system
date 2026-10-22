import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product, qty = 1) => {
        const quantity = Math.max(1, parseInt(qty, 10) || 1);
        const stock = typeof product.stock === 'number' ? product.stock : 999;
        if (stock <= 0) {
          return { success: false, message: 'This medicine is currently out of stock.' };
        }

        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.id === product.id);

        if (existingIndex > -1) {
          const currentQty = currentItems[existingIndex].quantity;
          const newQty = Math.min(currentQty + quantity, stock);
          if (newQty === currentQty) {
            return {
              success: false,
              message: `Maximum available stock (${stock}) already in your cart.`,
            };
          }
          const updated = [...currentItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
            maxStock: stock,
          };
          set({ items: updated });
          return { success: true, message: `Updated quantity in cart (${newQty}).` };
        }

        const effectivePrice =
          product.discountPrice && product.discountPrice < product.price
            ? product.discountPrice
            : product.price;

        const newItem = {
          id: product.id,
          catalogKey: product.catalogKey,
          name: product.name,
          genericName: product.genericName || '',
          brand: product.brand || '',
          category: product.category,
          price: product.price,
          discountPrice: product.discountPrice || null,
          effectivePrice,
          imageUrl: product.imageUrl || '',
          dosageForm: product.dosageForm || 'Tablets',
          strength: product.strength || '',
          packageSize: product.packageSize || '',
          prescriptionRequired: Boolean(product.prescriptionRequired),
          quantity: Math.min(quantity, stock),
          maxStock: stock,
        };

        set({ items: [...currentItems, newItem] });
        return { success: true, message: `${product.name} added to cart.` };
      },

      updateQuantity: (id, qty) => {
        const quantity = parseInt(qty, 10);
        if (isNaN(quantity) || quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const updated = get().items.map((item) => {
          if (item.id === id) {
            const capped = Math.min(quantity, item.maxStock || 999);
            return { ...item, quantity: capped };
          }
          return item;
        });
        set({ items: updated });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      // Helpers
      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price;
          return sum + price * item.quantity;
        }, 0);
      },

      getSavings: () => {
        return get().items.reduce((sum, item) => {
          if (item.discountPrice && item.discountPrice < item.price) {
            return sum + (item.price - item.discountPrice) * item.quantity;
          }
          return sum;
        }, 0);
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= 2000 ? 0 : 150; // Free delivery over PKR 2,000
      },

      getFinalTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal + get().getDeliveryFee();
      },

      hasPrescriptionItems: () => {
        return get().items.some((item) => item.prescriptionRequired);
      },
    }),
    {
      name: 'mediconnect_medicine_cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
