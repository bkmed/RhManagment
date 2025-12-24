/**
 * Native Storage Service using React Native MMKV  
 * Platform-specific implementation for iOS and Android
 */

import { createMMKV } from 'react-native-mmkv';

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

// Initialize MMKV storage instance for native platforms
const mmkvStorage = createMMKV();

export const storageService: StorageService = {
    getString: (key: string) => mmkvStorage.getString(key),
    setString: (key: string, value: string) => mmkvStorage.set(key, value),
    getNumber: (key: string) => mmkvStorage.getNumber(key),
    setNumber: (key: string, value: number) => mmkvStorage.set(key, value),
    getBoolean: (key: string) => mmkvStorage.getBoolean(key),
    setBoolean: (key: string, value: boolean) => mmkvStorage.set(key, value),
    delete: (key: string) => mmkvStorage.remove(key),
    clearAll: () => mmkvStorage.clearAll(),
};
