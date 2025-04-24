import { Platform } from "react-native"
import crashlytics from "@react-native-firebase/crashlytics"

// Initialize Crashlytics
export const initCrashlytics = () => {
  // Crashlytics is automatically initialized on mobile
  // No initialization needed for web
}

// Log error
export const logError = (error: Error) => {
  if (Platform.OS !== "web") {
    crashlytics().recordError(error)
  }
}

// Log message
export const logMessage = (message: string) => {
  if (Platform.OS !== "web") {
    crashlytics().log(message)
  }
}

// Set user ID
export const setCrashlyticsUserId = (userId: string | null) => {
  if (Platform.OS !== "web" && userId) {
    crashlytics().setUserId(userId)
  }
}

// Set custom key
export const setCustomKey = (key: string, value: string | number | boolean) => {
  if (Platform.OS !== "web") {
    if (typeof value === "string") {
      crashlytics().setAttribute(key, value)
    } else if (typeof value === "number") {
      crashlytics().setAttribute(key, value.toString())
    } else if (typeof value === "boolean") {
      crashlytics().setAttribute(key, value.toString())
    }
  }
}

// Set custom keys
export const setCustomKeys = (keys: Record<string, string | number | boolean>) => {
  if (Platform.OS !== "web") {
    Object.entries(keys).forEach(([key, value]) => {
      setCustomKey(key, value)
    })
  }
}
