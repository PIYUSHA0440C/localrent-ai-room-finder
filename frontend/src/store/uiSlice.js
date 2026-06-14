import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mobileMenuOpen: false,
    modalOpen: null, // 'booking', 'review', 'reject', etc.
    modalData: null,
  },
  reducers: {
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false;
    },
    openModal: (state, action) => {
      state.modalOpen = action.payload.type;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modalOpen = null;
      state.modalData = null;
    },
  },
});

export const { toggleMobileMenu, closeMobileMenu, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
