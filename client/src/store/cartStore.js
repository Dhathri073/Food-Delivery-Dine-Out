import { create } from 'zustand';
import api from '../lib/api';
import toast from 'react-hot-toast';

const useCartStore = create((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    try {
      const data = await api.get('/cart');
      set({ cart: data.cart });
    } catch {}
  },

  addToCart: async (restaurantId, menuItemId, quantity = 1) => {
    set({ isLoading: true });
    try {
      const data = await api.post('/cart/add', { restaurantId, menuItemId, quantity });
      set({ cart: data.cart, isLoading: false });
      toast.success('Added to cart');
    } catch (err) {
      set({ isLoading: false });
      toast.error(err.message || 'Failed to add to cart');
      throw err;
    }
  },

  updateItem: async (menuItemId, quantity) => {
    try {
      const data = await api.put(`/cart/item/${menuItemId}`, { quantity });
      set({ cart: data.cart });
    } catch (err) {
      toast.error(err.message || 'Failed to update cart');
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart/clear');
      set({ cart: null });
    } catch {}
  },

  itemCount: () => {
    const cart = get().cart;
    return cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  }
}));

export default useCartStore;
