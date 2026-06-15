import reviewService from '../services/reviewService.js';

// POST /api/reviews
export const createReview = async (req, res) => {
  const review = await reviewService.createReview(req.user._id, req.body);
  res.status(201).json({ message: 'Review submitted', review });
};

// GET /api/reviews/check-eligibility/:listingId
export const checkEligibility = async (req, res) => {
  const result = await reviewService.checkEligibility(req.user._id, req.params.listingId);
  res.json(result);
};

// GET /api/reviews/listing/:listingId
export const getListingReviews = async (req, res) => {
  const result = await reviewService.getListingReviews(req.params.listingId, req.query);
  res.json(result);
};

// PUT /api/reviews/:id
export const editReview = async (req, res) => {
  const review = await reviewService.editReview(req.params.id, req.user._id, req.body);
  res.json({ message: 'Review updated', review });
};
