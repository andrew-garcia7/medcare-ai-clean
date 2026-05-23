import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

// ================= STORE =================
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // 🔐 LOGIN
      login: async (email, password) => {
        set({ isLoading: true });

        try {
          const { data } = await api.post('/auth/login', {
            email,
            password,
          });

          // Set token
          api.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${data.token}`;

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      // 📝 REGISTER
      register: async (userData) => {
        set({ isLoading: true });

        try {
          const { data } = await api.post('/auth/register', userData);

          api.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${data.token}`;

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      // 🚪 LOGOUT
      logout: () => {
        api.post('/auth/logout').catch(() => {});

        delete api.defaults.headers.common['Authorization'];

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      // 🔄 UPDATE USER
      updateUser: (data) => {
        set((state) => ({
          user: state.user
            ? { ...state.user, ...data }
            : null,
        }));
      },

      // ✅ SET AUTH
setAuth: (status) => {
  set({
    isAuthenticated: status,
  });
},

      // 🔄 FETCH CURRENT USER
      fetchMe: async () => {
        const { token } = get();

        if (!token) return;

        try {
          api.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${token}`;

          const { data } = await api.get('/auth/me');

          // Merge backend user with local state to preserve client-side fields like avatar
          const currentUser = get().user;
          set({
            user: { ...currentUser, ...data.data.user },
            isAuthenticated: true,
          });

        } catch (err) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'medcare-auth',

      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);