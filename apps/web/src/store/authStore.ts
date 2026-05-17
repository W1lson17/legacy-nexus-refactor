import { create } from 'zustand';
import { api } from '../lib/axios';
import type { UserOutput } from '@legacy/shared';

interface AuthState {
  user: UserOutput | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserOutput) => void;
  clearUser: () => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<UserOutput | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user: UserOutput) => {
    set({ user, isAuthenticated: true });
  },

  clearUser: () => {
    set({ user: null, isAuthenticated: false });
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { user } = response.data;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async (): Promise<UserOutput | null> => {
    try {
      const response = await api.get('/api/auth/me');
      const { user } = response.data;
      set({ user, isAuthenticated: true });
      return user;
    } catch {
      set({ user: null, isAuthenticated: false });
      return null;
    }
  },
}));