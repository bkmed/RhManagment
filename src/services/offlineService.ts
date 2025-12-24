import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            setIsInternetReachable(state.isInternetReachable);
        });

        return () => unsubscribe();
    }, []);

    return {
        isConnected,
        isInternetReachable,
        isOffline: isConnected === false,
    };
};

// Check network status once
export const checkNetworkStatus = async () => {
    const state = await NetInfo.fetch();
    return {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
    };
};
