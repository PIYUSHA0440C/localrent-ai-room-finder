import aiService from '../services/aiService.js';
import reviewService from '../services/reviewService.js';

// POST /api/ai/smart-search
export const smartSearch = async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim().length < 3) {
    return res.status(400).json({ message: 'Search query must be at least 3 characters' });
  }

  const filters = await aiService.smartSearch(query);
  res.json({ filters });
};

// POST /api/ai/generate-description
export const generateDescription = async (req, res) => {
  const description = await aiService.generateDescription(req.body);
  res.json({ description });
};

// POST /api/ai/summarize-reviews
export const summarizeReviews = async (req, res) => {
  const { listingId } = req.body;

  if (!listingId) {
    return res.status(400).json({ message: 'Listing ID is required' });
  }

  const { reviews } = await reviewService.getListingReviews(listingId, { limit: 20 });
  const summary = await aiService.summarizeReviews(reviews);
  res.json({ summary });
};
