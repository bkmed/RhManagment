import { Platform } from "react-native"
import ReactGA from "react-ga4"
import analytics from "@react-native-firebase/analytics"

// Initialize Google Analytics
export const initAnalytics = () => {
  const measurementId = process.env.GA_MEASUREMENT_ID

  if (!measurementId) {
    console.warn("Google Analytics Measurement ID not provided. Analytics is disabled.")
    return
  }

  if (Platform.OS === "web") {
    // Web-specific initialization
    ReactGA.initialize(measurementId)
  }
  // Firebase Analytics is initialized automatically for mobile
}

// Track screen view
export const trackScreenView = (screenName: string, screenClass?: string) => {
  try {
    if (Platform.OS === "web") {
      ReactGA.send({ hitType: "pageview", page: `/${screenName}` })
    } else {
      analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      })
    }
  } catch (error) {
    console.error("Error tracking screen view:", error)
  }
}

// Track event
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (Platform.OS === "web") {
      ReactGA.event({
        category: params?.category || "General",
        action: eventName,
        label: params?.label,
        value: params?.value,
      })
    } else {
      analytics().logEvent(eventName, params)
    }
  } catch (error) {
    console.error("Error tracking event:", error)
  }
}

// Set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  try {
    if (Platform.OS === "web") {
      ReactGA.set(properties)
    } else {
      Object.entries(properties).forEach(([key, value]) => {
        analytics().setUserProperty(key, String(value))
      })
    }
  } catch (error) {
    console.error("Error setting user properties:", error)
  }
}

// Set user ID
export const setUserId = (userId: string | null) => {
  try {
    if (Platform.OS === "web") {
      if (userId) {
        ReactGA.set({ userId })
      }
    } else {
      analytics().setUserId(userId)
    }
  } catch (error) {
    console.error("Error setting user ID:", error)
  }
}
