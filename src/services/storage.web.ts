/**
 * Web Storage Service using localStorage (MMKV fallback)
 * Platform-specific implementation for web browsers
 */

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

// Web storage adapter using localStorage (MMKV not available on web)
const webStorage: StorageService = {
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

export const storageService = webStorage;
