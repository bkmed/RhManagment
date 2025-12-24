import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createLogger } from "redux-logger"
import thunk from "redux-thunk"

// Import reducers
import authReducer from "./slices/authSlice"
import employeeReducer from "./slices/employeeSlice"
import leaveReducer from "./slices/leaveSlice"
import payrollReducer from "./slices/payrollSlice"
import illnessReducer from "./slices/illnessSlice"
import uiReducer from "./slices/uiSlice"
import networkReducer from "./slices/networkSlice"

// Import middleware
import { networkMiddleware } from "./middleware/networkMiddleware"

// Configure persist
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "ui"], // Only persist these reducers
}

const rootReducer = combineReducers({
  auth: authReducer,
  employee: employeeReducer,
  leave: leaveReducer,
  payroll: payrollReducer,
  illness: illnessReducer,
  ui: uiReducer,
  network: networkReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure logger
const logger = createLogger({
  collapsed: true,
  duration: true,
})

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(thunk, logger, networkMiddleware),
})

export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
