import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notificationService';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { ModalProvider } from './src/context/ModalContext';
import { OfflineIndicator } from './src/components/OfflineIndicator';
import { WebThemeHandler } from './src/components/WebThemeHandler';
import './src/i18n'; // Initialize i18n

import { LoadingScreen } from './src/components/LoadingScreen';

const App = () => {
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Migrate old MMKV data to Redux format (one-time migration)
    const migrateData = async () => {
      try {
        const { storageService } = await import('./src/services/storage');
        const { store } = await import('./src/store');
        const { setLeaves } = await import('./src/store/slices/leavesSlice');
        const { setEmployees } = await import('./src/store/slices/employeesSlice');
        const { setPayroll } = await import('./src/store/slices/payrollSlice');
        const { setClaims } = await import('./src/store/slices/claimsSlice');
        const { setIllnesses } = await import('./src/store/slices/illnessesSlice');

        if (!storageService.getBoolean('redux_migrated')) {
          console.log('Migrating old MMKV data to Redux...');

          // Migrate each database
          const oldLeaves = storageService.getString('leaves');
          if (oldLeaves) store.dispatch(setLeaves(JSON.parse(oldLeaves)));

          const oldEmployees = storageService.getString('employees');
          if (oldEmployees) store.dispatch(setEmployees(JSON.parse(oldEmployees)));

          const oldPayroll = storageService.getString('payroll');
          if (oldPayroll) store.dispatch(setPayroll(JSON.parse(oldPayroll)));

          const oldClaims = storageService.getString('claims');
          if (oldClaims) store.dispatch(setClaims(JSON.parse(oldClaims)));

          const oldIllnesses = storageService.getString('illnesses');
          if (oldIllnesses) store.dispatch(setIllnesses(JSON.parse(oldIllnesses)));

          // Mark as migrated
          storageService.setBoolean('redux_migrated', true);

          // Optional: Clear old keys to save space
          storageService.delete('leaves');
          storageService.delete('employees');
          storageService.delete('payroll');
          storageService.delete('claims');
          storageService.delete('illnesses');

          console.log('Migration complete!');
        }
      } catch (error) {
        console.error('Migration error:', error);
      }
    };

    // Initialize session management
    const initializeSession = async () => {
      try {
        const { authService } = await import('./src/services/authService');
        const { sessionService } = await import('./src/services/sessionService');

        // Get current user from auth
        const currentUser = await authService.getCurrentUser();

        // Initialize session
        await sessionService.initSession(currentUser);

        // Listen for session expiry
        if (typeof window !== 'undefined') {
          const handleSessionExpiry = () => {
            console.log('Session expired - redirecting to login');
          };
          (window as any).addEventListener('session_expired', handleSessionExpiry);
        }

        console.log('Session service initialized');
      } catch (error) {
        console.error('Session initialization error:', error);
      }
    };

    // Initialize notifications (native only)
    // Note: MMKV storage is ready to use immediately, no initialization needed
    const initialize = async () => {
      try {
        // Initialize services
        const { servicesDb } = await import('./src/database/servicesDb');
        const { devicesDb } = await import('./src/database/devicesDb');
        await servicesDb.init();
        await devicesDb.init();

        // Migrate data first
        await migrateData();

        // Initialize session management
        await initializeSession();

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
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <ModalProvider>
                <SafeAreaProvider style={{ flex: 1 }}>
                  <WebThemeHandler />
                  <OfflineIndicator />
                  <AppNavigator />
                </SafeAreaProvider>
              </ModalProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
