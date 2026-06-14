import { Router } from 'express';
import { createReview, getListingReviews, editReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';
import { validateReview } from '../middleware/validate.js';

const router = Router();

// Public route
router.get('/listing/:listingId', getListingReviews);

// Authenticated routes
router.post('/', authenticate, validateReview, createReview);
router.put('/:id', authenticate, editReview);

export default router;
