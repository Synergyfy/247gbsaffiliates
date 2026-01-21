import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/mockApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      setAuth: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),

      clearAuth: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),

      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
    }),
    {
      name: 'artisans-auth',
    }
  )
);
