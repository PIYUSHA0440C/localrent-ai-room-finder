import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import { BOOKING_STATUSES, BOOKING_TRANSITIONS } from '../config/constants.js';
import notificationService from './notificationService.js';
import trustService from './trustService.js';

class BookingService {
  // Validate state transition
  validateTransition(currentStatus, newStatus) {
    const allowed = BOOKING_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      const error = new Error(
        `Cannot transition from '${currentStatus}' to '${newStatus}'`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Create booking request
  async createBooking(tenantId, data) {
    const { listingId, moveInDate, duration, message } = data;

    // Find listing
    const listing = await Listing.findById(listingId).populate('landlord', 'name email');
    if (!listing) {
      const error = new Error('Listing not found');
      error.statusCode = 404;
      throw error;
    }

    if (!listing.isAvailable || !listing.isActive) {
      const error = new Error('This listing is not available for booking');
      error.statusCode = 400;
      throw error;
    }

    // Can't book own listing
    if (listing.landlord._id.toString() === tenantId.toString()) {
      const error = new Error('You cannot book your own listing');
      error.statusCode = 400;
      throw error;
    }

    // Check for existing active/pending booking by same tenant for same listing
    const existingBooking = await Booking.findOne({
      tenant: tenantId,
      listing: listingId,
      status: { $in: [BOOKING_STATUSES.REQUESTED, BOOKING_STATUSES.APPROVED, BOOKING_STATUSES.ACTIVE] },
    });

    if (existingBooking) {
      const error = new Error('You already have an active or pending booking for this listing');
      error.statusCode = 400;
      throw error;
    }

    // Check if max occupants reached
    const activeAndApprovedBookingsCount = await Booking.countDocuments({
      listing: listingId,
      status: { $in: [BOOKING_STATUSES.ACTIVE, BOOKING_STATUSES.APPROVED] },
    });

    if (activeAndApprovedBookingsCount >= listing.maxOccupants) {
      const error = new Error('This listing has reached its maximum occupants');
      error.statusCode = 400;
      throw error;
    }

    // Create booking
    const booking = await Booking.create({
      listing: listingId,
      tenant: tenantId,
      landlord: listing.landlord._id,
      moveInDate: new Date(moveInDate),
      duration,
      message: message || '',
    });

    // Populate for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('listing', 'title rent type city area images')
      .populate('tenant', 'name email avatar phone trustScore trustBadge')
      .populate('landlord', 'name email avatar');

    // Send notification to landlord
    const tenant = await User.findById(tenantId);
    await notificationService.createNotification({
      user: listing.landlord._id,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `${tenant.name} has requested to book "${listing.title}"`,
      relatedBooking: booking._id,
      relatedListing: listingId,
    });

    return populatedBooking;
  }

  // Get tenant's bookings
  async getTenantBookings(tenantId, query = {}) {
    const { status, page = 1, limit = 20 } = query;
    const filter = { tenant: tenantId };
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('listing', 'title rent type city area images genderPreference')
        .populate('landlord', 'name email avatar phone trustScore')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return {
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  // Get landlord's received bookings
  async getLandlordBookings(landlordId, query = {}) {
    const { status, page = 1, limit = 20 } = query;
    const filter = { landlord: landlordId };
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('listing', 'title rent type city area images')
        .populate('tenant', 'name email avatar phone trustScore trustBadge city bio')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return {
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  // Approve booking
  async approveBooking(bookingId, landlordId) {
    const booking = await Booking.findById(bookingId)
      .populate('tenant', 'name email')
      .populate('listing', 'title');

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (booking.landlord.toString() !== landlordId.toString()) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    this.validateTransition(booking.status, BOOKING_STATUSES.APPROVED);

    booking.status = BOOKING_STATUSES.APPROVED;
    booking.statusHistory.push({
      status: BOOKING_STATUSES.APPROVED,
      timestamp: new Date(),
      note: 'Booking approved by landlord',
    });
    await booking.save();

    // Notify tenant
    await notificationService.createNotification({
      user: booking.tenant._id,
      type: 'booking_approved',
      title: 'Booking Approved! 🎉',
      message: `Your booking for "${booking.listing.title}" has been approved!`,
      relatedBooking: booking._id,
      relatedListing: booking.listing._id,
    });

    return booking;
  }

  // Reject booking
  async rejectBooking(bookingId, landlordId, reason = '') {
    const booking = await Booking.findById(bookingId)
      .populate('tenant', 'name email')
      .populate('listing', 'title');

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (booking.landlord.toString() !== landlordId.toString()) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    this.validateTransition(booking.status, BOOKING_STATUSES.REJECTED);

    booking.status = BOOKING_STATUSES.REJECTED;
    booking.rejectionReason = reason;
    booking.statusHistory.push({
      status: BOOKING_STATUSES.REJECTED,
      timestamp: new Date(),
      note: reason || 'Booking rejected by landlord',
    });
    await booking.save();

    // Notify tenant
    await notificationService.createNotification({
      user: booking.tenant._id,
      type: 'booking_rejected',
      title: 'Booking Update',
      message: `Your booking for "${booking.listing.title}" was not approved.${reason ? ` Reason: ${reason}` : ''}`,
      relatedBooking: booking._id,
      relatedListing: booking.listing._id,
    });

    return booking;
  }

  // Activate booking (tenant has moved in)
  async activateBooking(bookingId, landlordId) {
    const booking = await Booking.findById(bookingId)
      .populate('tenant', 'name email')
      .populate('listing', 'title');

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (booking.landlord.toString() !== landlordId.toString()) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    this.validateTransition(booking.status, BOOKING_STATUSES.ACTIVE);

    // Check if max occupants reached
    const activeCount = await Booking.countDocuments({
      listing: booking.listing._id,
      status: BOOKING_STATUSES.ACTIVE,
      _id: { $ne: bookingId },
    });

    const listing = await Listing.findById(booking.listing._id);

    if (activeCount >= listing.maxOccupants) {
      const error = new Error('This listing has reached its maximum occupants');
      error.statusCode = 409;
      throw error;
    }

    booking.status = BOOKING_STATUSES.ACTIVE;
    booking.statusHistory.push({
      status: BOOKING_STATUSES.ACTIVE,
      timestamp: new Date(),
      note: 'Tenant has moved in',
    });
    await booking.save();

    // Mark listing as unavailable ONLY if max occupants reached
    if (activeCount + 1 >= listing.maxOccupants) {
      await Listing.findByIdAndUpdate(booking.listing._id, { isAvailable: false });
    }

    // Notify tenant
    await notificationService.createNotification({
      user: booking.tenant._id,
      type: 'booking_activated',
      title: 'Welcome to your new place! 🏠',
      message: `Your stay at "${booking.listing.title}" is now active. We hope you enjoy your stay!`,
      relatedBooking: booking._id,
      relatedListing: booking.listing._id,
    });

    return booking;
  }

  // Complete booking
  async completeBooking(bookingId, landlordId) {
    const booking = await Booking.findById(bookingId)
      .populate('tenant', 'name email')
      .populate('listing', 'title');

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (booking.landlord.toString() !== landlordId.toString()) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    this.validateTransition(booking.status, BOOKING_STATUSES.COMPLETED);

    booking.status = BOOKING_STATUSES.COMPLETED;
    booking.statusHistory.push({
      status: BOOKING_STATUSES.COMPLETED,
      timestamp: new Date(),
      note: 'Booking completed',
    });
    await booking.save();

    // Mark listing as available again
    if (booking.listing) {
      await Listing.findByIdAndUpdate(booking.listing._id, { isAvailable: true });
    }

    // Update completed bookings count for both users
    const updatePromises = [User.findByIdAndUpdate(booking.landlord, { $inc: { completedBookings: 1 } })];
    if (booking.tenant) updatePromises.push(User.findByIdAndUpdate(booking.tenant._id, { $inc: { completedBookings: 1 } }));
    await Promise.all(updatePromises);

    // Update trust scores
    const trustPromises = [trustService.updateTrustScore(booking.landlord)];
    if (booking.tenant) trustPromises.push(trustService.updateTrustScore(booking.tenant._id));
    await Promise.all(trustPromises);

    // Notify tenant - request review
    if (booking.tenant) {
      await notificationService.createNotification({
        user: booking.tenant._id,
        type: 'review_request',
        title: 'How was your stay? ⭐',
        message: `Your stay at "${booking.listing?.title || 'a property'}" is complete. Share your experience to help others!`,
        relatedBooking: booking._id,
        relatedListing: booking.listing?._id,
      });
    }

    return booking;
  }

  // Cancel booking
  async cancelBooking(bookingId, userId) {
    const booking = await Booking.findById(bookingId)
      .populate('tenant', 'name email')
      .populate('landlord', 'name email')
      .populate('listing', 'title');

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // Both tenant and landlord can cancel
    const isTenant = booking.tenant._id.toString() === userId.toString();
    const isLandlord = booking.landlord._id.toString() === userId.toString();

    if (!isTenant && !isLandlord) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    // Tenants can only cancel from requested or approved states
    if (isTenant && !['requested', 'approved'].includes(booking.status)) {
      const error = new Error('You can only cancel pending or approved bookings');
      error.statusCode = 400;
      throw error;
    }

    this.validateTransition(booking.status, BOOKING_STATUSES.CANCELLED);

    const wasActive = booking.status === BOOKING_STATUSES.ACTIVE;

    booking.status = BOOKING_STATUSES.CANCELLED;
    booking.statusHistory.push({
      status: BOOKING_STATUSES.CANCELLED,
      timestamp: new Date(),
      note: `Cancelled by ${isTenant ? 'tenant' : 'landlord'}`,
    });
    await booking.save();

    // If was active, make listing available again
    if (wasActive) {
      await Listing.findByIdAndUpdate(booking.listing._id, { isAvailable: true });
    }

    // Notify the other party
    const notifyUserId = isTenant ? booking.landlord._id : booking.tenant._id;
    const cancellerName = isTenant ? booking.tenant.name : booking.landlord.name;

    await notificationService.createNotification({
      user: notifyUserId,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `${cancellerName} has cancelled the booking for "${booking.listing.title}"`,
      relatedBooking: booking._id,
      relatedListing: booking.listing._id,
    });

    return booking;
  }

  // Get single booking details
  async getBookingById(bookingId, userId) {
    const booking = await Booking.findById(bookingId)
      .populate('listing', 'title rent deposit type city area images genderPreference amenities landlord')
      .populate('tenant', 'name email avatar phone trustScore trustBadge city bio')
      .populate('landlord', 'name email avatar phone trustScore trustBadge');

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // Only tenant, landlord, or admin can view
    const isTenant = booking.tenant._id.toString() === userId.toString();
    const isLandlord = booking.landlord._id.toString() === userId.toString();

    if (!isTenant && !isLandlord) {
      const error = new Error('Not authorized to view this booking');
      error.statusCode = 403;
      throw error;
    }

    return booking;
  }
}

export default new BookingService();
