import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface NetworkState {
  isConnected: boolean
  isInternetReachable: boolean | null
  connectionType: string | null
  details: any | null
  lastChecked: number | null
}

const initialState: NetworkState = {
  isConnected: true, // Optimistically assume connected
  isInternetReachable: null,
  connectionType: null,
  details: null,
  lastChecked: null,
}

const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    setNetworkStatus: (state, action: PayloadAction<Partial<NetworkState>>) => {
      return {
        ...state,
        ...action.payload,
        lastChecked: Date.now(),
      }
    },
  },
})

export const { setNetworkStatus } = networkSlice.actions
export default networkSlice.reducer
