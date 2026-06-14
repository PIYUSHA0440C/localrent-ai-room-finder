import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

export const getListingReviews = createAsyncThunk('reviews/getListingReviews', async ({ listingId, params }, { rejectWithValue }) => {
  try {
    const response = await api.get(`/reviews/listing/${listingId}`, { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load reviews');
  }
});

export const createReview = createAsyncThunk('reviews/create', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/reviews', data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
  }
});

export const editReview = createAsyncThunk('reviews/edit', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to edit review');
  }
});

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearReviews: (state) => { state.reviews = []; state.pagination = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getListingReviews.pending, (state) => { state.loading = true; })
      .addCase(getListingReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.pagination = action.payload.pagination;
      })
      .addCase(getListingReviews.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload.review);
      })
      .addCase(editReview.fulfilled, (state, action) => {
        const idx = state.reviews.findIndex((r) => r._id === action.payload.review._id);
        if (idx !== -1) state.reviews[idx] = action.payload.review;
      });
  },
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
