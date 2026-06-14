import { Router } from 'express';
import {
  createListing, searchListings, getFeaturedListings, getMyListings,
  getListingById, updateListing, deleteListing, uploadImages, removeImage,
} from '../controllers/listingController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateListing } from '../middleware/validate.js';
import { uploadImages as uploadMiddleware } from '../middleware/upload.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// Public routes
router.get('/featured', getFeaturedListings);
router.get('/', searchListings);
router.get('/:id', getListingById);

// Landlord-only routes
router.post('/', authenticate, authorize(ROLES.LANDLORD), validateListing, createListing);
router.get('/dashboard/my-listings', authenticate, authorize(ROLES.LANDLORD), getMyListings);
router.put('/:id', authenticate, authorize(ROLES.LANDLORD), updateListing);
router.delete('/:id', authenticate, authorize(ROLES.LANDLORD), deleteListing);
router.post('/:id/images', authenticate, authorize(ROLES.LANDLORD), uploadMiddleware.array('images', 8), uploadImages);
router.delete('/:id/images/:fileId', authenticate, authorize(ROLES.LANDLORD), removeImage);

export default router;
