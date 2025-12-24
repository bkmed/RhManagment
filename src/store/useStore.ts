import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storageService } from '../services/storage';

interface AppState {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  user: { name: string } | null;
  setUser: (user: { name: string } | null) => void;
}

// Create a custom storage object for Zustand that uses our storageService
const zustandStorage = {
  getItem: (name: string) => {
    const value = storageService.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storageService.setString(name, value);
  },
  removeItem: (name: string) => {
    storageService.delete(name);
  },
};

export const useStore = create<AppState>()(
  persist(
    set => ({
      isLoading: false,
      setLoading: isLoading => set({ isLoading }),
      user: null,
      setUser: user => set({ user }),
    }),
    {
      name: 'medicare-app-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: state => ({ user: state.user }), // Only persist user, not isLoading
    },
  ),
);
