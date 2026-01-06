import { Platform } from 'react-native';
import {
  PERMISSIONS,
  request,
  check,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { notificationService } from './notificationService';

// Declare web-only globals
declare global {
  interface Navigator {
    permissions?: {
      query(permissionDesc: {
        name: PermissionName;
      }): Promise<{ state: PermissionState }>;
    };
    mediaDevices?: {
      getUserMedia(constraints: {
        video?: boolean;
        audio?: boolean;
      }): Promise<MediaStream>;
    };
  }
  interface MediaStream {
    getTracks(): Array<{ stop(): void }>;
  }
  interface Window {
    Notification?: {
      permission: 'granted' | 'denied' | 'default';
      requestPermission(): Promise<'granted' | 'denied' | 'default'>;
    };
    localStorage: {
      getItem(key: string): string | null;
      setItem(key: string, value: string): void;
      removeItem(key: string): void;
    };
  }
  const Notification: {
    permission: 'granted' | 'denied' | 'default';
    requestPermission(): Promise<'granted' | 'denied' | 'default'>;
  };
  const localStorage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  };
  type PermissionName =
    | 'camera'
    | 'microphone'
    | 'geolocation'
    | 'notifications'
    | 'persistent-storage'
    | 'midi'
    | 'push'
    | 'background-fetch'
    | 'periodic-background-sync'
    | 'accelerometer'
    | 'gyroscope'
    | 'magnetometer'
    | 'ambient-light-sensor';
  type PermissionState = 'granted' | 'denied' | 'prompt';
}

export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable'
  | 'limited';

class PermissionsService {
  /**
   * Check camera permission status
   */
  async checkCameraPermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      const nav =
        typeof window !== 'undefined'
          ? (window as unknown as { navigator: Navigator }).navigator
          : null;
      if (nav?.permissions?.query) {
        try {
          const result = await nav.permissions.query({ name: 'camera' });
          return this.mapWebPermissionState(result.state);
        } catch {
          if (nav.mediaDevices?.getUserMedia) {
            return 'denied';
          }
        }
      } else if (nav?.mediaDevices?.getUserMedia) {
        return 'denied';
      }
      return 'unavailable';
    }

    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;
    const result = await check(permission);
    return this.mapNativePermissionStatus(result);
  }

  /**
   * Request camera permission
   */
  async requestCameraPermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      const nav =
        typeof window !== 'undefined'
          ? (window as unknown as { navigator: Navigator }).navigator
          : null;
      if (nav?.mediaDevices?.getUserMedia) {
        try {
          const stream = await nav.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((track: { stop(): void }) => track.stop());
          return 'granted';
        } catch (error: unknown) {
          const err = error as { name: string };
          if (
            err.name === 'NotAllowedError' ||
            err.name === 'PermissionDeniedError'
          ) {
            return 'blocked';
          }
          return 'denied';
        }
      }
      return 'unavailable';
    }

    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;
    const result = await request(permission);
    return this.mapNativePermissionStatus(result);
  }

  /**
   * Check notification permission status
   */
  async checkNotificationPermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      try {
        const nav =
          typeof window !== 'undefined'
            ? (window as unknown as { navigator: Navigator }).navigator
            : null;
        if (nav?.permissions?.query) {
          const result = await nav.permissions.query({ name: 'notifications' });
          return this.mapWebPermissionState(result.state);
        }
      } catch {
        // Ignore and fall back
      }

      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = Notification.permission;
        if (permission === 'granted') return 'granted';
        if (permission === 'denied') return 'blocked';
        return 'denied';
      }
      return 'unavailable';
    }

    const settings = await notifee.getNotificationSettings();
    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED)
      return 'granted';
    if (settings.authorizationStatus === AuthorizationStatus.DENIED)
      return 'denied';
    return 'unavailable';
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') return 'granted';
          if (permission === 'denied') return 'blocked';
          return 'denied';
        } catch {
          return 'denied';
        }
      }
      return 'unavailable';
    }

    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED)
      return 'granted';
    if (settings.authorizationStatus === AuthorizationStatus.DENIED)
      return 'denied';
    return 'unavailable';
  }

  /**
   * Check calendar permission status
   */
  async checkCalendarPermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const permission = localStorage.getItem('calendar-permission');
        if (permission === 'granted') return 'granted';
        return 'denied';
      }
      return 'unavailable';
    }

    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CALENDARS
        : PERMISSIONS.ANDROID.WRITE_CALENDAR;
    const result = await check(permission);
    return this.mapNativePermissionStatus(result);
  }

  /**
   * Request calendar permission
   */
  async requestCalendarPermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem('calendar-permission', 'granted');
          return 'granted';
        } catch {
          return 'denied';
        }
      }
      return 'unavailable';
    }

    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CALENDARS
        : PERMISSIONS.ANDROID.WRITE_CALENDAR;
    const result = await request(permission);
    return this.mapNativePermissionStatus(result);
  }

  /**
   * Check storage permission status
   */
  async checkStoragePermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      return 'granted'; // Browsers handle storage differently
    }

    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY // On iOS, it's often Photo Library for general "Documents/Media"
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    const result = await check(permission);
    return this.mapNativePermissionStatus(result);
  }

  /**
   * Request storage permission
   */
  async requestStoragePermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      return 'granted';
    }

    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    const result = await request(permission);
    return this.mapNativePermissionStatus(result);
  }

  private mapWebPermissionState(state: PermissionState): PermissionStatus {
    switch (state) {
      case 'granted':
        return 'granted';
      case 'denied':
        return 'blocked';
      case 'prompt':
        return 'denied';
      default:
        return 'denied';
    }
  }

  private mapNativePermissionStatus(status: string): PermissionStatus {
    switch (status) {
      case RESULTS.GRANTED:
        return 'granted';
      case RESULTS.DENIED:
        return 'denied';
      case RESULTS.BLOCKED:
        return 'blocked';
      case RESULTS.LIMITED:
        return 'limited';
      case RESULTS.UNAVAILABLE:
        return 'unavailable';
      default:
        return 'denied';
    }
  }

  async openAppSettings(): Promise<void> {
    if (Platform.OS === 'web') {
      notificationService.showAlert(
        'Permissions',
        'Please check your browser settings to manage permissions.',
      );
      return;
    }

    try {
      await openSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  }
}

export const permissionsService = new PermissionsService();
