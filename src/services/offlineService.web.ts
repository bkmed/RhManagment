/**
 * Web-specific Offline Service
 * Uses browser's navigator.onLine API for network status detection
 */
import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean>(() => {
        if (typeof window !== 'undefined' && (window as any).navigator) {
            return (window as any).navigator.onLine;
        }
        return true;
    });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleOnline = () => setIsConnected(true);
        const handleOffline = () => setIsConnected(false);

        const win = window as any;
        win.addEventListener('online', handleOnline);
        win.addEventListener('offline', handleOffline);

        return () => {
            win.removeEventListener('online', handleOnline);
            win.removeEventListener('offline', handleOffline);
        };
    }, []);

    return {
        isConnected,
        isInternetReachable: isConnected,
        isOffline: !isConnected,
    };
};

// Check network status once
export const checkNetworkStatus = async () => {
    let isConnected = true;
    if (typeof window !== 'undefined' && (window as any).navigator) {
        isConnected = (window as any).navigator.onLine;
    }
    return {
        isConnected,
        isInternetReachable: isConnected,
    };
};
