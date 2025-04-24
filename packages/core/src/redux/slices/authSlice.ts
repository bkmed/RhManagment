import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import {
  signIn,
  signUp,
  signOut as firebaseSignOut,
  getCurrentUser,
  sendPasswordReset,
  type AuthUser,
  type SignInData,
  type SignUpData,
} from "../../../../auth/src/auth-service"

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  passwordResetSent: boolean
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  passwordResetSent: false,
}

export const loginUser = createAsyncThunk("auth/login", async (credentials: SignInData, { rejectWithValue }) => {
  try {
    const user = await signIn(credentials)
    return user
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to login")
  }
})

export const registerUser = createAsyncThunk("auth/register", async (userData: SignUpData, { rejectWithValue }) => {
  try {
    const user = await signUp(userData)
    return user
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to register")
  }
})

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await firebaseSignOut()
    return null
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to logout")
  }
})

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const user = await getCurrentUser()
    return user
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch current user")
  }
})

export const resetPassword = createAsyncThunk("auth/resetPassword", async (email: string, { rejectWithValue }) => {
  try {
    await sendPasswordReset(email)
    return email
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to send password reset email")
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearPasswordResetStatus: (state) => {
      state.passwordResetSent = false
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthUser>) => {
      state.loading = false
      state.user = action.payload
      state.isAuthenticated = true
    })
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthUser>) => {
      state.loading = false
      state.user = action.payload
      state.isAuthenticated = true
    })
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Logout
    builder.addCase(logoutUser.pending, (state) => {
      state.loading = true
    })
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.loading = false
      state.user = null
      state.isAuthenticated = false
    })
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch current user
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.loading = true
    })
    builder.addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<AuthUser | null>) => {
      state.loading = false
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    })
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
      state.isAuthenticated = false
    })

    // Reset password
    builder.addCase(resetPassword.pending, (state) => {
      state.loading = true
      state.error = null
      state.passwordResetSent = false
    })
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.loading = false
      state.passwordResetSent = true
    })
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
      state.passwordResetSent = false
    })
  },
})

export const { clearError, clearPasswordResetStatus } = authSlice.actions
export default authSlice.reducer
