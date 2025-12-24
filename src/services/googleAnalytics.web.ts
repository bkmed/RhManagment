/**
 * Web Google Analytics Service using Firebase Analytics for Web
 * Platform-specific implementation for web browsers
 */

import { getAnalytics, logEvent as firebaseLogEvent, setUserProperties, setUserId as firebaseSetUserId } from 'firebase/analytics';
import { app } from '../config/firebase';

let webAnalytics: ReturnType<typeof getAnalytics> | null = null;

// Initialize web analytics
try {
    if (app) {
        webAnalytics = getAnalytics(app);
        console.log('Google Analytics initialized for Web');
    }
} catch (error) {
    console.warn('Failed to initialize Web Analytics:', error);
}

export const googleAnalytics = {
    logEvent: async (name: string, params?: { [key: string]: any }) => {
        try {
            if (webAnalytics) {
                firebaseLogEvent(webAnalytics, name, params);
                console.log('[Web Analytics] Event logged:', name, params);
            } else {
                console.log('[Web Analytics] (Not Initialized) Event:', name, params);
            }
        } catch (error) {
            console.warn('Error logging event:', error);
        }
    },

    logScreenView: async (screenName: string, screenClass: string = screenName) => {
        try {
            if (webAnalytics) {
                firebaseLogEvent(webAnalytics, 'screen_view', {
                    firebase_screen: screenName,
                    firebase_screen_class: screenClass,
                });
                console.log('[Web Analytics] Screen view logged:', screenName);
            }
        } catch (error) {
            console.warn('Error logging screen view:', error);
        }
    },

    setUserProperty: async (name: string, value: string) => {
        try {
            if (webAnalytics) {
                setUserProperties(webAnalytics, { [name]: value });
            }
        } catch (error) {
            console.warn('Error setting user property:', error);
        }
    },

    setUserId: async (userId: string | null) => {
        try {
            if (webAnalytics) {
                firebaseSetUserId(webAnalytics, userId);
            }
        } catch (error) {
            console.warn('Error setting user ID:', error);
        }
    },
};
