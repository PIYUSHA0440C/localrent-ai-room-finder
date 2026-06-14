import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
      unique: true, // one review per booking
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing is required'],
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer is required'],
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Landlord is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [1000, 'Review must be at most 1000 characters'],
      trim: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ landlord: 1 });
reviewSchema.index({ booking: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
