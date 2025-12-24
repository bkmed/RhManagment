/**
 * Web-specific Offline Service
 * Uses browser's navigator.onLine API for network status detection
 */
import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean>(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleOnline = () => setIsConnected(true);
        const handleOffline = () => setIsConnected(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
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
    const isConnected = typeof navigator !== 'undefined' ? navigator.onLine : true;
    return {
        isConnected,
        isInternetReachable: isConnected,
    };
};
