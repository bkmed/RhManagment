import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false, // In redux-persist, rehydration handles loading state usually via PersistGate
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: state => {
      state.user = null;
    },
  },
});

export const { setUser, setLoading, logout } = authSlice.actions;

export default authSlice.reducer;
