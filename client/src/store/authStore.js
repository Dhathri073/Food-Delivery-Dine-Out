import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await api.post('/auth/login', { email, password });
          localStorage.setItem('token', data.token);
          connectSocket(data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          return data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (name, email, password, role) => {
        set({ isLoading: true });
        try {
          const data = await api.post('/auth/register', { name, email, password, role });
          localStorage.setItem('token', data.token);
          connectSocket(data.token);
          set({ user: data.user, token: data.token, isLoading: false });
          return data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        disconnectSocket();
        set({ user: null, token: null });
      },

      refreshUser: async () => {
        try {
          const data = await api.get('/auth/me');
          set({ user: data.user });
        } catch { get().logout(); }
      }
    }),
    { name: 'auth-store', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);

export default useAuthStore;
