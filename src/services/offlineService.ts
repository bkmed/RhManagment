import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<
    boolean | null
  >(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;

      const handleOnline = () => setIsConnected(true);
      const handleOffline = () => setIsConnected(false);

      const win = window as any;
      setIsConnected(win.navigator.onLine);
      win.addEventListener('online', handleOnline);
      win.addEventListener('offline', handleOffline);

      return () => {
        win.removeEventListener('online', handleOnline);
        win.removeEventListener('offline', handleOffline);
      };
    } else {
      const NetInfo = require('@react-native-community/netinfo').default;
      const unsubscribe = NetInfo.addEventListener((state: any) => {
        setIsConnected(state.isConnected);
        setIsInternetReachable(state.isInternetReachable);
      });

      return () => unsubscribe();
    }
  }, []);

  return {
    isConnected,
    isInternetReachable:
      Platform.OS === 'web' ? isConnected : isInternetReachable,
    isOffline: isConnected === false,
  };
};

export const checkNetworkStatus = async () => {
  if (Platform.OS === 'web') {
    let connected = true;
    if (typeof window !== 'undefined' && (window as any).navigator) {
      connected = (window as any).navigator.onLine;
    }
    return {
      isConnected: connected,
      isInternetReachable: connected,
    };
  } else {
    const NetInfo = require('@react-native-community/netinfo').default;
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
    };
  }
};
