import bookingService from '../services/bookingService.js';

// POST /api/bookings
export const createBooking = async (req, res) => {
  const booking = await bookingService.createBooking(req.user._id, req.body);
  res.status(201).json({ message: 'Booking request sent', booking });
};

// GET /api/bookings/my-bookings
export const getMyBookings = async (req, res) => {
  const result = await bookingService.getTenantBookings(req.user._id, req.query);
  res.json(result);
};

// GET /api/bookings/landlord-bookings
export const getLandlordBookings = async (req, res) => {
  const result = await bookingService.getLandlordBookings(req.user._id, req.query);
  res.json(result);
};

// GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user._id);
  res.json({ booking });
};

// PUT /api/bookings/:id/approve
export const approveBooking = async (req, res) => {
  const booking = await bookingService.approveBooking(req.params.id, req.user._id);
  res.json({ message: 'Booking approved', booking });
};

// PUT /api/bookings/:id/reject
export const rejectBooking = async (req, res) => {
  const booking = await bookingService.rejectBooking(req.params.id, req.user._id, req.body.reason);
  res.json({ message: 'Booking rejected', booking });
};

// PUT /api/bookings/:id/activate
export const activateBooking = async (req, res) => {
  const booking = await bookingService.activateBooking(req.params.id, req.user._id);
  res.json({ message: 'Booking activated', booking });
};

// PUT /api/bookings/:id/complete
export const completeBooking = async (req, res) => {
  const booking = await bookingService.completeBooking(req.params.id, req.user._id);
  res.json({ message: 'Booking completed', booking });
};

// PUT /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user._id);
  res.json({ message: 'Booking cancelled', booking });
};
