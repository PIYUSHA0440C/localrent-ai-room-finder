import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

// Search listings
export const searchListings = createAsyncThunk('listings/search', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/listings', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Search failed');
  }
});

// Get featured listings
export const getFeaturedListings = createAsyncThunk('listings/featured', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/listings/featured');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load listings');
  }
});

// Get single listing
export const getListingById = createAsyncThunk('listings/getById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Listing not found');
  }
});

// Get my listings (landlord)
export const getMyListings = createAsyncThunk('listings/myListings', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/listings/dashboard/my-listings', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load listings');
  }
});

// Create listing
export const createListing = createAsyncThunk('listings/create', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/listings', data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create listing');
  }
});

// Update listing
export const updateListing = createAsyncThunk('listings/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/listings/${id}`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update listing');
  }
});

// Delete listing
export const deleteListing = createAsyncThunk('listings/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/listings/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete listing');
  }
});

// Upload images
export const uploadListingImages = createAsyncThunk('listings/uploadImages', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/listings/${id}/images`, formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Image upload failed');
  }
});

// Remove image
export const removeListingImage = createAsyncThunk('listings/removeImage', async ({ listingId, fileId }, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/listings/${listingId}/images/${fileId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to remove image');
  }
});

const listingSlice = createSlice({
  name: 'listings',
  initialState: {
    listings: [],
    currentListing: null,
    myListings: [],
    featured: { topRated: [], recent: [] },
    pagination: null,
    myPagination: null,
    loading: false,
    detailLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentListing: (state) => {
      state.currentListing = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search
      .addCase(searchListings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(searchListings.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload.listings;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchListings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Featured
      .addCase(getFeaturedListings.pending, (state) => { state.loading = true; })
      .addCase(getFeaturedListings.fulfilled, (state, action) => {
        state.loading = false;
        state.featured = action.payload;
      })
      .addCase(getFeaturedListings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Get by ID
      .addCase(getListingById.pending, (state) => { state.detailLoading = true; state.error = null; })
      .addCase(getListingById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentListing = action.payload.listing;
      })
      .addCase(getListingById.rejected, (state, action) => { state.detailLoading = false; state.error = action.payload; })
      // My listings
      .addCase(getMyListings.pending, (state) => { state.loading = true; })
      .addCase(getMyListings.fulfilled, (state, action) => {
        state.loading = false;
        state.myListings = action.payload.listings;
        state.myPagination = action.payload.pagination;
      })
      .addCase(getMyListings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Create
      .addCase(createListing.fulfilled, (state, action) => {
        state.myListings.unshift(action.payload.listing);
      })
      // Update
      .addCase(updateListing.fulfilled, (state, action) => {
        state.currentListing = action.payload.listing;
        const idx = state.myListings.findIndex((l) => l._id === action.payload.listing._id);
        if (idx !== -1) state.myListings[idx] = action.payload.listing;
      })
      // Delete
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.myListings = state.myListings.filter((l) => l._id !== action.payload);
      })
      // Upload images
      .addCase(uploadListingImages.fulfilled, (state, action) => {
        state.currentListing = action.payload.listing;
      })
      // Remove image
      .addCase(removeListingImage.fulfilled, (state, action) => {
        state.currentListing = action.payload.listing;
      });
  },
});

export const { clearCurrentListing, clearError } = listingSlice.actions;
export default listingSlice.reducer;
