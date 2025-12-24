import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notificationService';
import { ThemeProvider } from './src/context/ThemeContext';
import { OfflineIndicator } from './src/components/OfflineIndicator';
import { WebThemeHandler } from './src/components/WebThemeHandler';
import './src/i18n'; // Initialize i18n

import { LoadingScreen } from './src/components/LoadingScreen';

const App = () => {
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Initialize notifications (native only)
    // Note: MMKV storage is ready to use immediately, no initialization needed
    const initialize = async () => {
      try {
        // Only initialize native modules on iOS/Android
        if (Platform.OS !== 'web') {
          await notificationService.initialize();
          console.log('App initialized successfully');
        } else {
          console.log('Running on web - Google Analytics auto-initialized');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  if (loading) {
    return (
      <ThemeProvider>
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <WebThemeHandler />
        <OfflineIndicator />
        <AppNavigator />
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default App;
