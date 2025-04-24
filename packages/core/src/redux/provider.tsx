import type React from "react"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { store, persistor } from "./store"
import { NetworkStatusMonitor } from "../components/network-status-monitor"

interface ReduxProviderProps {
  children: React.ReactNode
  loading?: React.ReactNode
}

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children, loading = null }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={loading} persistor={persistor}>
        <NetworkStatusMonitor />
        {children}
      </PersistGate>
    </Provider>
  )
}
