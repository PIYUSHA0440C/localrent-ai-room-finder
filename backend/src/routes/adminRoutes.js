import { Router } from 'express';
import {
  getStats, getUsers, toggleSuspend, getListings,
  toggleListingActive, getReviews, toggleReviewHide, recalculateTrust,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/suspend', toggleSuspend);
router.get('/listings', getListings);
router.put('/listings/:id/toggle-active', toggleListingActive);
router.get('/reviews', getReviews);
router.put('/reviews/:id/toggle-hide', toggleReviewHide);
router.post('/recalculate-trust', recalculateTrust);

export default router;
