import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';

export const getNotifications = createAsyncThunk('notifications/get', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/notifications', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load notifications');
  }
});

export const getUnreadCount = createAsyncThunk('notifications/unreadCount', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    await api.put(`/notifications/${id}/read`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.put('/notifications/read-all');
    return true;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    pagination: null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => { state.loading = true; })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.pagination = action.payload.pagination;
      })
      .addCase(getNotifications.rejected, (state) => { state.loading = false; })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const n = state.items.find((i) => i._id === action.payload);
        if (n && !n.isRead) {
          n.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      });
  },
});

export default notificationSlice.reducer;
