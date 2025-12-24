import type { Middleware } from "@reduxjs/toolkit"
import NetInfo from "@react-native-community/netinfo"
import { setNetworkStatus } from "../slices/networkSlice"

export const networkMiddleware: Middleware = (store) => {
  // Subscribe to network status changes
  const unsubscribe = NetInfo.addEventListener((state) => {
    store.dispatch(
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        connectionType: state.type,
        details: state.details,
      }),
    )
  })

  return (next) => (action) => {
    // Check if we need to handle offline actions
    if (action.meta?.requiresConnection) {
      const { isConnected } = store.getState().network

      if (!isConnected) {
        // If offline and action requires connection, queue it for later
        // You could implement a queue system here
        console.log("Action queued due to offline status:", action)
        return
      }
    }

    return next(action)
  }
}
