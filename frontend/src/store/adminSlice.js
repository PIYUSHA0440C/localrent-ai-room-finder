import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

export const getAdminStats = createAsyncThunk('admin/stats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const getAdminUsers = createAsyncThunk('admin/users', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const toggleSuspendUser = createAsyncThunk('admin/suspend', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/users/${id}/suspend`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const getAdminListings = createAsyncThunk('admin/listings', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/listings', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const toggleListingActive = createAsyncThunk('admin/toggleListing', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/listings/${id}/toggle-active`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const getAdminReviews = createAsyncThunk('admin/reviews', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/reviews', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const toggleReviewHide = createAsyncThunk('admin/toggleReview', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/reviews/${id}/toggle-hide`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: [],
    listings: [],
    reviews: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAdminStats.pending, (state) => { state.loading = true; })
      .addCase(getAdminStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload.stats; })
      .addCase(getAdminStats.rejected, (state) => { state.loading = false; })
      .addCase(getAdminUsers.fulfilled, (state, action) => { state.users = action.payload.users; state.pagination = action.payload.pagination; })
      .addCase(toggleSuspendUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload.user._id);
        if (idx !== -1) state.users[idx] = action.payload.user;
      })
      .addCase(getAdminListings.fulfilled, (state, action) => { state.listings = action.payload.listings; state.pagination = action.payload.pagination; })
      .addCase(toggleListingActive.fulfilled, (state, action) => {
        const idx = state.listings.findIndex((l) => l._id === action.payload.listing._id);
        if (idx !== -1) state.listings[idx] = action.payload.listing;
      })
      .addCase(getAdminReviews.fulfilled, (state, action) => { state.reviews = action.payload.reviews; state.pagination = action.payload.pagination; })
      .addCase(toggleReviewHide.fulfilled, (state, action) => {
        const idx = state.reviews.findIndex((r) => r._id === action.payload.review._id);
        if (idx !== -1) state.reviews[idx] = action.payload.review;
      });
  },
});

export default adminSlice.reducer;
