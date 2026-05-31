import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:4000'

export interface AuthState {
  token: string | null
  user: { id: number; email: string; name?: string } | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
}

export const signup = createAsyncThunk(
  'auth/signup',
  async (data: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, data)
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Signup failed')
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data, { withCredentials: true })
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed')
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true })
    return null
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Logout failed')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload
    },
    clearAuth: (state) => {
      state.token = null
      state.user = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder.addCase(signup.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(signup.fulfilled, (state, action) => {
      state.loading = false
      state.user = action.payload
    })
    builder.addCase(signup.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false
      state.token = action.payload.accessToken
      state.user = action.payload.user || { id: 0, email: '' }
    })
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Logout
    builder.addCase(logout.pending, (state) => {
      state.loading = true
    })
    builder.addCase(logout.fulfilled, (state) => {
      state.loading = false
      state.token = null
      state.user = null
      state.error = null
    })
    builder.addCase(logout.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export const { setToken, setUser, clearAuth } = authSlice.actions
export default authSlice.reducer
