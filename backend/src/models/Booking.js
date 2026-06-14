import mongoose from 'mongoose';
import { BOOKING_STATUSES } from '../config/constants.js';

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing is required'],
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tenant is required'],
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Landlord is required'],
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUSES),
      default: BOOKING_STATUSES.REQUESTED,
    },
    moveInDate: {
      type: Date,
      required: [true, 'Move-in date is required'],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: 'Move-in date must be in the future',
      },
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 month'],
      max: [36, 'Duration must be at most 36 months'],
    },
    message: {
      type: String,
      maxlength: [500, 'Message must be at most 500 characters'],
      default: '',
    },
    rejectionReason: {
      type: String,
      maxlength: [300, 'Rejection reason must be at most 300 characters'],
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(BOOKING_STATUSES),
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: '',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ tenant: 1, status: 1 });
bookingSchema.index({ landlord: 1, status: 1 });
bookingSchema.index({ listing: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });

// Add initial status to history on creation
bookingSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: BOOKING_STATUSES.REQUESTED,
      timestamp: new Date(),
      note: 'Booking request created',
    });
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
