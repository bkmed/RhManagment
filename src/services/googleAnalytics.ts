import { Platform } from 'react-native';

let webAnalytics: any = null;
let nativeAnalytics: any = null;

if (Platform.OS === 'web') {
  try {
    const { getAnalytics } = require('firebase/analytics');
    const { app } = require('../config/firebase');
    if (app) {
      webAnalytics = getAnalytics(app);
      console.log('Google Analytics initialized for Web');
    }
  } catch (error) {
    console.warn('Failed to initialize Web Analytics:', error);
  }
} else {
  try {
    nativeAnalytics = require('@react-native-firebase/analytics').default;
  } catch (error) {
    console.warn('Failed to load Native Analytics:', error);
  }
}

export const googleAnalytics = {
  logEvent: async (name: string, params?: { [key: string]: any }) => {
    try {
      if (Platform.OS === 'web') {
        if (webAnalytics) {
          const { logEvent: firebaseLogEvent } = require('firebase/analytics');
          firebaseLogEvent(webAnalytics, name, params);
        }
      } else {
        if (nativeAnalytics) {
          await nativeAnalytics().logEvent(name, params);
        }
      }
    } catch (error) {
      console.warn('Error logging event:', error);
    }
  },

  logScreenView: async (
    screenName: string,
    screenClass: string = screenName,
  ) => {
    try {
      if (Platform.OS === 'web') {
        if (webAnalytics) {
          const { logEvent: firebaseLogEvent } = require('firebase/analytics');
          firebaseLogEvent(webAnalytics, 'screen_view', {
            firebase_screen: screenName,
            firebase_screen_class: screenClass,
          });
        }
      } else {
        if (nativeAnalytics) {
          await nativeAnalytics().logScreenView({
            screen_name: screenName,
            screen_class: screenClass,
          });
        }
      }
    } catch (error) {
      console.warn('Error logging screen view:', error);
    }
  },

  setUserProperty: async (name: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        if (webAnalytics) {
          const { setUserProperties } = require('firebase/analytics');
          setUserProperties(webAnalytics, { [name]: value });
        }
      } else {
        if (nativeAnalytics) {
          await nativeAnalytics().setUserProperty(name, value);
        }
      }
    } catch (error) {
      console.warn('Error setting user property:', error);
    }
  },

  setUserId: async (userId: string | null) => {
    try {
      if (Platform.OS === 'web') {
        if (webAnalytics) {
          const {
            setUserId: firebaseSetUserId,
          } = require('firebase/analytics');
          firebaseSetUserId(webAnalytics, userId);
        }
      } else {
        if (nativeAnalytics) {
          await nativeAnalytics().setUserId(userId);
        }
      }
    } catch (error) {
      console.warn('Error setting user ID:', error);
    }
  },
};
