import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import trustService from '../services/trustService.js';

// GET /api/admin/stats
export const getStats = async (req, res) => {
  const [totalUsers, totalListings, totalBookings, totalReviews, usersByRole, bookingsByStatus, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments(),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt').lean(),
    ]);

  res.json({
    stats: {
      totalUsers,
      totalListings,
      totalBookings,
      totalReviews,
      usersByRole: usersByRole.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      bookingsByStatus: bookingsByStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      recentUsers,
    },
  });
};

// GET /api/admin/users
export const getUsers = async (req, res) => {
  const { page = 1, limit = 20, role, search, suspended } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (role) filter.role = role;
  if (suspended === 'true') filter.isSuspended = true;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({
    users,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
};

// PUT /api/admin/users/:id/suspend
export const toggleSuspend = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.role === 'admin') {
    return res.status(400).json({ message: 'Cannot suspend admin users' });
  }

  user.isSuspended = !user.isSuspended;
  await user.save();

  res.json({
    message: user.isSuspended ? 'User suspended' : 'User unsuspended',
    user,
  });
};

// GET /api/admin/listings
export const getListings = async (req, res) => {
  const { page = 1, limit = 20, active, search } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (active !== undefined) filter.isActive = active === 'true';
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { area: { $regex: search, $options: 'i' } },
    ];
  }

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate('landlord', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Listing.countDocuments(filter),
  ]);

  res.json({
    listings,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
};

// PUT /api/admin/listings/:id/toggle-active
export const toggleListingActive = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return res.status(404).json({ message: 'Listing not found' });
  }

  listing.isActive = !listing.isActive;
  if (!listing.isActive) listing.isAvailable = false;
  await listing.save();

  res.json({
    message: listing.isActive ? 'Listing activated' : 'Listing deactivated',
    listing,
  });
};

// GET /api/admin/reviews
export const getReviews = async (req, res) => {
  const { page = 1, limit = 20, hidden } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (hidden === 'true') filter.isHidden = true;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('reviewer', 'name email')
      .populate('listing', 'title city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Review.countDocuments(filter),
  ]);

  res.json({
    reviews,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
};

// PUT /api/admin/reviews/:id/toggle-hide
export const toggleReviewHide = async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  review.isHidden = !review.isHidden;
  await review.save();

  // Recalculate listing ratings after hiding/showing review
  const reviewService = (await import('../services/reviewService.js')).default;
  await reviewService.updateListingRating(review.listing);

  res.json({
    message: review.isHidden ? 'Review hidden' : 'Review visible',
    review,
  });
};

// POST /api/admin/recalculate-trust
export const recalculateTrust = async (req, res) => {
  const result = await trustService.recalculateAll();
  res.json({ message: 'Trust scores recalculated', ...result });
};
