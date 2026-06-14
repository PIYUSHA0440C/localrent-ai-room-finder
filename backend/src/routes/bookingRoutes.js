import { Router } from 'express';
import {
  createBooking, getMyBookings, getLandlordBookings, getBookingById,
  approveBooking, rejectBooking, activateBooking, completeBooking, cancelBooking,
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBooking } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// Tenant routes
router.post('/', authorize(ROLES.TENANT), validateBooking, createBooking);
router.get('/my-bookings', authorize(ROLES.TENANT), getMyBookings);

// Landlord routes
router.get('/landlord-bookings', authorize(ROLES.LANDLORD), getLandlordBookings);
router.put('/:id/approve', authorize(ROLES.LANDLORD), approveBooking);
router.put('/:id/reject', authorize(ROLES.LANDLORD), rejectBooking);
router.put('/:id/activate', authorize(ROLES.LANDLORD), activateBooking);
router.put('/:id/complete', authorize(ROLES.LANDLORD), completeBooking);

// Both tenant and landlord can cancel
router.put('/:id/cancel', cancelBooking);

// Both can view booking details
router.get('/:id', getBookingById);

export default router;
