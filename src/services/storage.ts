import { Platform } from 'react-native';

export interface StorageService {
  getString: (key: string) => string | undefined;
  setString: (key: string, value: string) => void;
  getNumber: (key: string) => number | undefined;
  setNumber: (key: string, value: number) => void;
  getBoolean: (key: string) => boolean | undefined;
  setBoolean: (key: string, value: boolean) => void;
  delete: (key: string) => void;
  clearAll: () => void;
}

let storageServiceImplementation: StorageService;

if (Platform.OS === 'web') {
  storageServiceImplementation = {
    getString: (key: string): string | undefined => {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key) || undefined;
      }
      return undefined;
    },

    setString: (key: string, value: string): void => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    },

    getNumber: (key: string): number | undefined => {
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = window.localStorage.getItem(key);
        return value ? parseFloat(value) : undefined;
      }
      return undefined;
    },

    setNumber: (key: string, value: number): void => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value.toString());
      }
    },

    getBoolean: (key: string): boolean | undefined => {
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = window.localStorage.getItem(key);
        return value === 'true' ? true : value === 'false' ? false : undefined;
      }
      return undefined;
    },

    setBoolean: (key: string, value: boolean): void => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value.toString());
      }
    },

    delete: (key: string): void => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    },

    clearAll: (): void => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    },
  };
} else {
  // Native Storage Service using React Native MMKV
  const { createMMKV } = require('react-native-mmkv');
  const mmkvStorage = createMMKV();

  storageServiceImplementation = {
    getString: (key: string) => mmkvStorage.getString(key),
    setString: (key: string, value: string) => mmkvStorage.set(key, value),
    getNumber: (key: string) => mmkvStorage.getNumber(key),
    setNumber: (key: string, value: number) => mmkvStorage.set(key, value),
    getBoolean: (key: string) => mmkvStorage.getBoolean(key),
    setBoolean: (key: string, value: boolean) => mmkvStorage.set(key, value),
    delete: (key: string) => mmkvStorage.remove(key),
    clearAll: () => mmkvStorage.clearAll(),
  };
}

export const storageService = storageServiceImplementation;
