import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import * as authApi from '@/api/auth';
import { auth } from '@/api';

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: localStorage.getItem('token'),
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      login: async (email: string, password: string) => {
        const { access_token } = await auth.login({ username: email, password });
        localStorage.setItem('token', access_token);
        set({ token: access_token });
        const user = await authApi.getCurrentUser();
        set({ user });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },
      getCurrentUser: async () => {
        const user = await authApi.getCurrentUser();
        set({ user });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
); 