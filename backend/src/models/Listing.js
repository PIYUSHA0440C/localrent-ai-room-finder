import mongoose from 'mongoose';
import { LISTING_TYPES, GENDER_PREFERENCES, FURNISHING_TYPES, AMENITIES_LIST } from '../config/constants.js';

const listingSchema = new mongoose.Schema(
  {
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Landlord is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description must be at most 2000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Listing type is required'],
      enum: LISTING_TYPES,
    },
    rent: {
      type: Number,
      required: [true, 'Rent is required'],
      min: [500, 'Rent must be at least ₹500'],
      max: [500000, 'Rent must be at most ₹5,00,000'],
    },
    deposit: {
      type: Number,
      required: [true, 'Deposit is required'],
      min: [0, 'Deposit cannot be negative'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      lowercase: true,
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
      lowercase: true,
      trim: true,
    },
    landmark: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address must be at most 200 characters'],
      default: '',
    },
    amenities: {
      type: [String],
      enum: AMENITIES_LIST,
      default: [],
    },
    houseRules: {
      type: [String],
      default: [],
    },
    genderPreference: {
      type: String,
      enum: GENDER_PREFERENCES,
      default: 'any',
    },
    images: [
      {
        url: { type: String, required: true },
        fileId: { type: String, required: true },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxOccupants: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    furnishing: {
      type: String,
      enum: FURNISHING_TYPES,
      default: 'semi_furnished',
    },
    mealsIncluded: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search performance
listingSchema.index({ city: 1, area: 1 });
listingSchema.index({ type: 1 });
listingSchema.index({ rent: 1 });
listingSchema.index({ genderPreference: 1 });
listingSchema.index({ isAvailable: 1, isActive: 1 });
listingSchema.index({ landlord: 1 });
listingSchema.index({ createdAt: -1 });

// Text index for search
listingSchema.index(
  { title: 'text', description: 'text', area: 'text', landmark: 'text', city: 'text' },
  { weights: { title: 10, area: 5, landmark: 5, city: 3, description: 1 } }
);

// Virtual for formatted rent
listingSchema.virtual('formattedRent').get(function () {
  if (this.rent == null) return null;
  return `₹${this.rent.toLocaleString('en-IN')}`;
});

// Validate max images
listingSchema.pre('save', function (next) {
  if (this.images && this.images.length > 8) {
    return next(new Error('Maximum 8 images allowed'));
  }
  next();
});

listingSchema.set('toJSON', { virtuals: true });
listingSchema.set('toObject', { virtuals: true });

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
