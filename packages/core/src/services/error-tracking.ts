import * as Sentry from "@sentry/react-native"
import { Platform } from "react-native"
import { BrowserTracing } from "@sentry/browser"

// Initialize Sentry
export const initSentry = () => {
  const dsn = process.env.SENTRY_DSN

  if (!dsn) {
    console.warn("Sentry DSN not provided. Error tracking is disabled.")
    return
  }

  if (Platform.OS === "web") {
    // Web-specific initialization
    Sentry.init({
      dsn,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    })
  } else {
    // React Native initialization
    Sentry.init({
      dsn,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
    })
  }
}

// Capture exceptions
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
      Sentry.captureException(error)
    })
  } else {
    Sentry.captureException(error)
  }
}

// Set user context
export const setUserContext = (user: { id: string; email?: string; username?: string } | null) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    })
  } else {
    Sentry.setUser(null)
  }
}

// Add breadcrumb
export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: Sentry.Severity,
  data?: Record<string, any>,
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  })
}

// Set tags
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value)
}

// Clear user context
export const clearUserContext = () => {
  Sentry.setUser(null)
}

// Log error
export const logError = (error: Error) => {
  if (Platform.OS !== "web") {
    Sentry.captureException(error)
  }
}
