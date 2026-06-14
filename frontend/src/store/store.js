import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import listingReducer from './listingSlice';
import bookingReducer from './bookingSlice';
import reviewReducer from './reviewSlice';
import notificationReducer from './notificationSlice';
import adminReducer from './adminSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    listings: listingReducer,
    bookings: bookingReducer,
    reviews: reviewReducer,
    notifications: notificationReducer,
    admin: adminReducer,
    ui: uiReducer,
  },
});

export default store;
