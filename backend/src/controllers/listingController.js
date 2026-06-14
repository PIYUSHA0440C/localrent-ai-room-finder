import listingService from '../services/listingService.js';

// POST /api/listings
export const createListing = async (req, res) => {
  const listing = await listingService.createListing(req.user._id, req.body);
  res.status(201).json({ message: 'Listing created', listing });
};

// GET /api/listings
export const searchListings = async (req, res) => {
  const result = await listingService.searchListings(req.query);
  res.json(result);
};

// GET /api/listings/featured
export const getFeaturedListings = async (req, res) => {
  const result = await listingService.getFeaturedListings();
  res.json(result);
};

// GET /api/listings/my-listings
export const getMyListings = async (req, res) => {
  const result = await listingService.getLandlordListings(req.user._id, req.query);
  res.json(result);
};

// GET /api/listings/:id
export const getListingById = async (req, res) => {
  const listing = await listingService.getListingById(req.params.id);
  res.json({ listing });
};

// PUT /api/listings/:id
export const updateListing = async (req, res) => {
  const listing = await listingService.updateListing(req.params.id, req.user._id, req.body);
  res.json({ message: 'Listing updated', listing });
};

// DELETE /api/listings/:id
export const deleteListing = async (req, res) => {
  await listingService.deleteListing(req.params.id, req.user._id);
  res.json({ message: 'Listing deleted' });
};

// POST /api/listings/:id/images
export const uploadImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Please upload at least one image' });
  }

  const listing = await listingService.addImages(req.params.id, req.user._id, req.files);
  res.json({ message: 'Images uploaded', listing });
};

// DELETE /api/listings/:id/images/:fileId
export const removeImage = async (req, res) => {
  const listing = await listingService.removeImage(req.params.id, req.user._id, req.params.fileId);
  res.json({ message: 'Image removed', listing });
};
