import { Router } from 'express';
import { smartSearch, generateDescription, summarizeReviews } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/smart-search', smartSearch);
router.post('/generate-description', generateDescription);
router.post('/summarize-reviews', summarizeReviews);

export default router;
