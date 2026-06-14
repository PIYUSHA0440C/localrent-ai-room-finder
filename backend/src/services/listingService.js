import Listing from '../models/Listing.js';
import imageService from './imageService.js';

class ListingService {
  // Create a new listing
  async createListing(landlordId, data) {
    const listing = await Listing.create({
      landlord: landlordId,
      title: data.title,
      description: data.description,
      type: data.type,
      rent: data.rent,
      deposit: data.deposit,
      city: data.city.toLowerCase(),
      area: data.area.toLowerCase(),
      landmark: data.landmark?.toLowerCase() || '',
      address: data.address || '',
      amenities: data.amenities || [],
      houseRules: data.houseRules || [],
      genderPreference: data.genderPreference || 'any',
      maxOccupants: data.maxOccupants || 1,
      furnishing: data.furnishing || 'semi_furnished',
      mealsIncluded: data.mealsIncluded || false,
    });

    return listing.populate('landlord', 'name email avatar trustScore trustBadge');
  }

  // Get single listing by ID
  async getListingById(id) {
    const listing = await Listing.findById(id).populate(
      'landlord',
      'name email avatar phone bio city trustScore trustBadge completedBookings averageRating createdAt'
    );

    if (!listing) {
      const error = new Error('Listing not found');
      error.statusCode = 404;
      throw error;
    }

    // Increment view count
    listing.viewCount += 1;
    await listing.save();

    return listing;
  }

  // Search and filter listings
  async searchListings(query) {
    const {
      search,
      city,
      area,
      landmark,
      type,
      minRent,
      maxRent,
      gender,
      amenities,
      furnishing,
      mealsIncluded,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = query;

    const filter = {
      isAvailable: true,
      isActive: true,
    };

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Location filters
    if (city) filter.city = city.toLowerCase();
    if (area) filter.area = { $regex: area.toLowerCase(), $options: 'i' };
    if (landmark) filter.landmark = { $regex: landmark.toLowerCase(), $options: 'i' };

    // Type filter
    if (type) {
      if (Array.isArray(type)) {
        filter.type = { $in: type };
      } else {
        filter.type = type;
      }
    }

    // Rent range
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = parseInt(minRent);
      if (maxRent) filter.rent.$lte = parseInt(maxRent);
    }

    // Gender preference
    if (gender && gender !== 'any') {
      filter.genderPreference = { $in: [gender, 'any'] };
    }

    // Amenities filter - must have ALL specified amenities
    if (amenities) {
      const amenityList = Array.isArray(amenities) ? amenities : amenities.split(',');
      filter.amenities = { $all: amenityList };
    }

    // Furnishing filter
    if (furnishing) filter.furnishing = furnishing;

    // Meals included
    if (mealsIncluded !== undefined) filter.mealsIncluded = mealsIncluded === 'true';

    // Sort options
    const sortOptions = {};
    if (search && !sortBy) {
      // If text search, sort by relevance by default
      sortOptions.score = { $meta: 'textScore' };
    } else {
      const validSorts = ['createdAt', 'rent', 'averageRating', 'viewCount'];
      const field = validSorts.includes(sortBy) ? sortBy : 'createdAt';
      sortOptions[field] = sortOrder === 'asc' ? 1 : -1;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('landlord', 'name avatar trustScore trustBadge')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    return {
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    };
  }

  // Get landlord's own listings
  async getLandlordListings(landlordId, query = {}) {
    const { page = 1, limit = 20 } = query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { landlord: landlordId };

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    return {
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  // Update listing
  async updateListing(listingId, landlordId, data) {
    const listing = await Listing.findById(listingId);

    if (!listing) {
      const error = new Error('Listing not found');
      error.statusCode = 404;
      throw error;
    }

    if (listing.landlord.toString() !== landlordId.toString()) {
      const error = new Error('Not authorized to update this listing');
      error.statusCode = 403;
      throw error;
    }

    // Update only allowed fields
    const allowedUpdates = [
      'title', 'description', 'type', 'rent', 'deposit', 'city', 'area',
      'landmark', 'address', 'amenities', 'houseRules', 'genderPreference',
      'maxOccupants', 'furnishing', 'mealsIncluded', 'isAvailable',
    ];

    allowedUpdates.forEach((field) => {
      if (data[field] !== undefined) {
        if (['city', 'area', 'landmark'].includes(field) && typeof data[field] === 'string') {
          listing[field] = data[field].toLowerCase();
        } else {
          listing[field] = data[field];
        }
      }
    });

    await listing.save();
    return listing.populate('landlord', 'name email avatar trustScore trustBadge');
  }

  // Delete listing
  async deleteListing(listingId, landlordId) {
    const listing = await Listing.findById(listingId);

    if (!listing) {
      const error = new Error('Listing not found');
      error.statusCode = 404;
      throw error;
    }

    if (listing.landlord.toString() !== landlordId.toString()) {
      const error = new Error('Not authorized to delete this listing');
      error.statusCode = 403;
      throw error;
    }

    // Delete images from ImageKit
    if (listing.images && listing.images.length > 0) {
      await imageService.deleteMultipleImages(listing.images);
    }

    await Listing.findByIdAndDelete(listingId);
    return listing;
  }

  // Add images to listing
  async addImages(listingId, landlordId, files) {
    const listing = await Listing.findById(listingId);

    if (!listing) {
      const error = new Error('Listing not found');
      error.statusCode = 404;
      throw error;
    }

    if (listing.landlord.toString() !== landlordId.toString()) {
      const error = new Error('Not authorized to modify this listing');
      error.statusCode = 403;
      throw error;
    }

    if (listing.images.length + files.length > 8) {
      const error = new Error(`Can add at most ${8 - listing.images.length} more images (max 8)`);
      error.statusCode = 400;
      throw error;
    }

    const uploadedImages = await imageService.uploadMultipleImages(files, 'listings');
    listing.images.push(...uploadedImages);
    await listing.save();

    return listing;
  }

  // Remove image from listing
  async removeImage(listingId, landlordId, fileId) {
    const listing = await Listing.findById(listingId);

    if (!listing) {
      const error = new Error('Listing not found');
      error.statusCode = 404;
      throw error;
    }

    if (listing.landlord.toString() !== landlordId.toString()) {
      const error = new Error('Not authorized to modify this listing');
      error.statusCode = 403;
      throw error;
    }

    const imageIndex = listing.images.findIndex((img) => img.fileId === fileId);
    if (imageIndex === -1) {
      const error = new Error('Image not found');
      error.statusCode = 404;
      throw error;
    }

    // Delete from ImageKit
    await imageService.deleteImage(fileId);

    // Remove from listing
    listing.images.splice(imageIndex, 1);
    await listing.save();

    return listing;
  }

  // Get featured/recent listings for landing page
  async getFeaturedListings() {
    const [topRated, recent] = await Promise.all([
      Listing.find({ isAvailable: true, isActive: true, averageRating: { $gte: 3.5 } })
        .populate('landlord', 'name avatar trustScore trustBadge')
        .sort({ averageRating: -1, viewCount: -1 })
        .limit(6)
        .lean(),
      Listing.find({ isAvailable: true, isActive: true })
        .populate('landlord', 'name avatar trustScore trustBadge')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    return { topRated, recent };
  }
}

export default new ListingService();
