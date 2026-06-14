import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import { BOOKING_STATUSES } from '../config/constants.js';
import trustService from './trustService.js';

class ReviewService {
  // Create a review
  async createReview(reviewerId, data) {
    const { bookingId, rating, comment } = data;

    // Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    // Only the tenant can review
    if (booking.tenant.toString() !== reviewerId.toString()) {
      const error = new Error('Only the tenant can leave a review');
      error.statusCode = 403;
      throw error;
    }

    // Must be completed
    if (booking.status !== BOOKING_STATUSES.COMPLETED) {
      const error = new Error('You can only review completed bookings');
      error.statusCode = 400;
      throw error;
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      const error = new Error('You have already reviewed this booking');
      error.statusCode = 400;
      throw error;
    }

    // Create review
    const review = await Review.create({
      booking: bookingId,
      listing: booking.listing,
      reviewer: reviewerId,
      landlord: booking.landlord,
      rating,
      comment,
    });

    // Update listing average rating
    await this.updateListingRating(booking.listing);

    // Update landlord average rating and trust score
    await this.updateLandlordRating(booking.landlord);
    await trustService.updateTrustScore(booking.landlord);

    return review.populate('reviewer', 'name avatar trustBadge');
  }

  // Edit review (allowed once)
  async editReview(reviewId, reviewerId, data) {
    const review = await Review.findById(reviewId);

    if (!review) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }

    if (review.reviewer.toString() !== reviewerId.toString()) {
      const error = new Error('Not authorized to edit this review');
      error.statusCode = 403;
      throw error;
    }

    if (review.isEdited) {
      const error = new Error('This review has already been edited once');
      error.statusCode = 400;
      throw error;
    }

    if (data.rating) review.rating = data.rating;
    if (data.comment) review.comment = data.comment;
    review.isEdited = true;
    await review.save();

    // Update listing and landlord ratings
    await this.updateListingRating(review.listing);
    await this.updateLandlordRating(review.landlord);
    await trustService.updateTrustScore(review.landlord);

    return review.populate('reviewer', 'name avatar trustBadge');
  }

  // Get reviews for a listing
  async getListingReviews(listingId, query = {}) {
    const { page = 1, limit = 10 } = query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { listing: listingId, isHidden: false };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('reviewer', 'name avatar trustBadge')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments(filter),
    ]);

    return {
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  // Update listing's average rating
  async updateListingRating(listingId) {
    const result = await Review.aggregate([
      { $match: { listing: listingId, isHidden: false } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const stats = result[0] || { averageRating: 0, totalReviews: 0 };

    await Listing.findByIdAndUpdate(listingId, {
      averageRating: Math.round(stats.averageRating * 10) / 10,
      totalReviews: stats.totalReviews,
    });
  }

  // Update landlord's average rating across all listings
  async updateLandlordRating(landlordId) {
    const result = await Review.aggregate([
      { $match: { landlord: landlordId, isHidden: false } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const stats = result[0] || { averageRating: 0, totalRatings: 0 };

    await User.findByIdAndUpdate(landlordId, {
      averageRating: Math.round(stats.averageRating * 10) / 10,
      totalRatingsReceived: stats.totalRatings,
    });
  }
}

export default new ReviewService();
