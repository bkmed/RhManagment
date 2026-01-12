import { storageService } from './storage';
import { User } from './authService';

declare const navigator: any;

const SESSION_KEY = 'session_data';
const LAST_ACTIVITY_KEY = 'last_activity';
const DEVICE_INFO_KEY = 'device_info';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export interface SessionData {
  user: User | null;
  deviceId: string;
  lastActivity: number;
  isActive: boolean;
}

export interface DeviceInfo {
  deviceId: string;
  platform: string;
  lastLogin: string;
  userAgent?: string;
}

class SessionService {
  private sessionCheckInterval: any | null = null; // Use any to avoid NodeJS type conflicts

  /**
   * Initialize session on app start
   */
  async initSession(user: User | null): Promise<void> {
    const deviceInfo = this.getDeviceInfo();
    const sessionData: SessionData = {
      user,
      deviceId: deviceInfo.deviceId,
      lastActivity: Date.now(),
      isActive: true,
    };

    storageService.setString(SESSION_KEY, JSON.stringify(sessionData));
    this.updateLastActivity();
    this.startSessionMonitoring();
  }

  /**
   * Get current session data
   */
  getSession(): SessionData | null {
    const sessionJson = storageService.getString(SESSION_KEY);
    if (!sessionJson) return null;

    try {
      return JSON.parse(sessionJson);
    } catch {
      return null;
    }
  }

  /**
   * Check if session is valid
   */
  isSessionValid(): boolean {
    const session = this.getSession();
    if (!session || !session.user) return false;

    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;

    // Session expired if inactive for more than SESSION_TIMEOUT
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      this.clearSession();
      return false;
    }

    return session.isActive;
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity(): void {
    const session = this.getSession();
    if (session) {
      session.lastActivity = Date.now();
      storageService.setString(SESSION_KEY, JSON.stringify(session));
    }
    storageService.setNumber(LAST_ACTIVITY_KEY, Date.now());
  }

  /**
   * Get device information
   */
  getDeviceInfo(): DeviceInfo {
    const existingInfo = storageService.getString(DEVICE_INFO_KEY);
    if (existingInfo) {
      try {
        return JSON.parse(existingInfo);
      } catch {
        // Fall through to create new device info
      }
    }

    // Create new device info
    const deviceInfo: DeviceInfo = {
      deviceId: this.generateDeviceId(),
      platform: this.getPlatform(),
      lastLogin: new Date().toISOString(),
      userAgent:
        typeof navigator !== 'undefined'
          ? (navigator as any).userAgent
          : undefined,
    };

    storageService.setString(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
    return deviceInfo;
  }

  /**
   * Generate unique device ID
   */
  private generateDeviceId(): string {
    const existingId = storageService.getString('device_id');
    if (existingId) return existingId;

    const id = `device_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    storageService.setString('device_id', id);
    return id;
  }

  /**
   * Get platform information
   */
  private getPlatform(): string {
    if (typeof navigator === 'undefined') return 'unknown';

    const userAgent = (navigator as any).userAgent.toLowerCase();
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad'))
      return 'ios';
    return 'web';
  }

  /**
   * Clear session
   */
  clearSession(): void {
    const session = this.getSession();
    if (session) {
      session.isActive = false;
      session.user = null;
      storageService.setString(SESSION_KEY, JSON.stringify(session));
    }
    this.stopSessionMonitoring();
  }

  /**
   * Start monitoring session for inactivity
   */
  private startSessionMonitoring(): void {
    if (this.sessionCheckInterval) return;

    // Check session validity every minute
    this.sessionCheckInterval = setInterval(() => {
      if (!this.isSessionValid()) {
        console.log('Session expired due to inactivity');
        this.clearSession();
        // Trigger logout event if needed
        this.handleSessionExpired();
      }
    }, 60 * 1000); // Check every minute
  }

  /**
   * Stop monitoring session
   */
  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  /**
   * Handle session expiration
   */
  private handleSessionExpired(): void {
    // Emit event or trigger navigation to login
    if (typeof window !== 'undefined') {
      (window as any).dispatchEvent(
        new (window as any).Event('session_expired'),
      );
    }
  }

  /**
   * Refresh session with updated user info
   */
  refreshSession(user: User): void {
    const session = this.getSession();
    if (session) {
      session.user = user;
      session.lastActivity = Date.now();
      storageService.setString(SESSION_KEY, JSON.stringify(session));
    }
  }

  /**
   * Get time until session expires (in minutes)
   */
  getTimeUntilExpiry(): number {
    const session = this.getSession();
    if (!session) return 0;

    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;
    const timeRemaining = SESSION_TIMEOUT - timeSinceLastActivity;

    return Math.max(0, Math.floor(timeRemaining / (60 * 1000)));
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const session = this.getSession();
    return session !== null && session.user !== null && this.isSessionValid();
  }

  /**
   * Get current user from session
   */
  getCurrentUser(): User | null {
    const session = this.getSession();
    return session?.user || null;
  }
}

export const sessionService = new SessionService();
