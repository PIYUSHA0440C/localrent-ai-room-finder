import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

// Register
export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

// Login
export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

// Get current user
export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to get user');
  }
});

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore logout errors
  }
  localStorage.removeItem('accessToken');
});

// Update profile
export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const response = await api.put('/users/profile', data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Profile update failed');
  }
});

// Update avatar
export const updateAvatar = createAsyncThunk('auth/updateAvatar', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.put('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Avatar upload failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    initialLoading: true,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get me
      .addCase(getMe.pending, (state) => {
        state.initialLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.initialLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.initialLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      // Update avatar
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
