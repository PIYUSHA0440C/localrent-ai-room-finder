import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

export const createBooking = createAsyncThunk('bookings/create', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/bookings', data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Booking failed');
  }
});

export const getMyBookings = createAsyncThunk('bookings/myBookings', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load bookings');
  }
});

export const getLandlordBookings = createAsyncThunk('bookings/landlordBookings', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/bookings/landlord-bookings', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load bookings');
  }
});

export const approveBooking = createAsyncThunk('bookings/approve', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/bookings/${id}/approve`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to approve');
  }
});

export const rejectBooking = createAsyncThunk('bookings/reject', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/bookings/${id}/reject`, { reason });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to reject');
  }
});

export const activateBooking = createAsyncThunk('bookings/activate', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/bookings/${id}/activate`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to activate');
  }
});

export const completeBooking = createAsyncThunk('bookings/complete', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/bookings/${id}/complete`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to complete');
  }
});

export const cancelBooking = createAsyncThunk('bookings/cancel', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to cancel');
  }
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    myBookings: [],
    landlordBookings: [],
    pagination: null,
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.myBookings.unshift(action.payload.booking);
      })
      .addCase(createBooking.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      .addCase(getMyBookings.pending, (state) => { state.loading = true; })
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(getLandlordBookings.pending, (state) => { state.loading = true; })
      .addCase(getLandlordBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.landlordBookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
      })
      .addCase(getLandlordBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Status transition handlers
    const updateBookingInList = (state, action, listKey) => {
      state.actionLoading = false;
      const updated = action.payload.booking;
      const list = state[listKey];
      const idx = list.findIndex((b) => b._id === updated._id);
      if (idx !== -1) list[idx] = { ...list[idx], status: updated.status };
    };

    [approveBooking, rejectBooking, activateBooking, completeBooking, cancelBooking].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => { state.actionLoading = true; state.error = null; })
        .addCase(thunk.fulfilled, (state, action) => {
          updateBookingInList(state, action, 'landlordBookings');
          updateBookingInList(state, action, 'myBookings');
        })
        .addCase(thunk.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });
    });
  },
});

export const { clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
