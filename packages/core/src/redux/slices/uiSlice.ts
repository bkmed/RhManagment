import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface UIState {
  theme: "light" | "dark" | "system"
  language: string
  sidebarOpen: boolean
  onboardingComplete: boolean
  notifications: {
    id: string
    type: "success" | "error" | "info" | "warning"
    message: string
    duration?: number
  }[]
}

const initialState: UIState = {
  theme: "system",
  language: "en",
  sidebarOpen: true,
  onboardingComplete: false,
  notifications: [],
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.onboardingComplete = action.payload
    },
    addNotification: (state, action: PayloadAction<Omit<UIState["notifications"][0], "id">>) => {
      state.notifications.push({
        ...action.payload,
        id: Date.now().toString(),
      })
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((notification) => notification.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const {
  setTheme,
  setLanguage,
  toggleSidebar,
  setSidebarOpen,
  setOnboardingComplete,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions

export default uiSlice.reducer
