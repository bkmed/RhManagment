import { Platform } from "react-native"
import { initSentry, setUserContext, clearUserContext } from "../../packages/core/src/services/error-tracking"
import { initAnalytics, setUserId, trackScreenView } from "../../packages/core/src/services/analytics"
import { initCrashlytics, setCrashlyticsUserId, setCustomKeys } from "../../packages/core/src/services/crashlytics"
import type { AuthUser } from "../../packages/auth/src/auth-service"
import { logError } from "../../packages/core/src/services/error-tracking"

// Initialize all app services
export const initAppServices = () => {
  // Initialize error tracking
  initSentry()

  // Initialize analytics
  initAnalytics()

  // Initialize crashlytics
  initCrashlytics()

  console.log("App services initialized")
}

// Set user data across all services
export const setUserData = (user: AuthUser | null) => {
  if (user) {
    // Set user context for error tracking
    setUserContext({
      id: user.uid,
      email: user.email || undefined,
      username: user.displayName || undefined,
    })

    // Set user ID for analytics
    setUserId(user.uid)

    // Set user ID for crashlytics
    setCrashlyticsUserId(user.uid)

    // Set additional user properties for crashlytics
    setCustomKeys({
      email: user.email || "not_set",
      displayName: user.displayName || "not_set",
      role: user.role,
    })
  } else {
    // Clear user data
    clearUserContext()
    setUserId(null)
    setCrashlyticsUserId(null)
  }
}

// Track screen view
export const trackScreen = (screenName: string) => {
  trackScreenView(screenName)
}

// Log error with context
export const logErrorWithContext = (error: Error, context?: Record<string, any>) => {
  // Log to console
  console.error("Error:", error, context)

  // Log to crashlytics
  if (Platform.OS !== "web") {
    if (context) {
      setCustomKeys(context)
    }
    logError(error)
  }
}
