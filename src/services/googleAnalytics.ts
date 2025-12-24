/**
 * Native Google Analytics Service using React Native Firebase Analytics
 * Platform-specific implementation for iOS and Android
 */

import analytics from '@react-native-firebase/analytics';

export const googleAnalytics = {
    logEvent: async (name: string, params?: { [key: string]: any }) => {
        try {
            await analytics().logEvent(name, params);
            console.log('[Native Analytics] Event logged:', name, params);
        } catch (error) {
            console.warn('Error logging event:', error);
        }
    },

    logScreenView: async (screenName: string, screenClass: string = screenName) => {
        try {
            await analytics().logScreenView({
                screen_name: screenName,
                screen_class: screenClass,
            });
            console.log('[Native Analytics] Screen view logged:', screenName);
        } catch (error) {
            console.warn('Error logging screen view:', error);
        }
    },

    setUserProperty: async (name: string, value: string) => {
        try {
            await analytics().setUserProperty(name, value);
        } catch (error) {
            console.warn('Error setting user property:', error);
        }
    },

    setUserId: async (userId: string | null) => {
        try {
            await analytics().setUserId(userId);
        } catch (error) {
            console.warn('Error setting user ID:', error);
        }
    },
};
