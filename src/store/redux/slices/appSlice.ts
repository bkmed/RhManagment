/**
 * App Slice - Redux state for app-level data
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isLoading: boolean;
  user: { name: string } | null;
}

const initialState: AppState = {
  isLoading: false,
  user: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action: PayloadAction<{ name: string } | null>) => {
      state.user = action.payload;
    },
  },
});

export const { setLoading, setUser } = appSlice.actions;
export default appSlice.reducer;
