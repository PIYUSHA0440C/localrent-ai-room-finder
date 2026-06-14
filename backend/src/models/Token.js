import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // TTL index, auto-delete expired tokens
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
tokenSchema.index({ token: 1 });
tokenSchema.index({ user: 1 });

const Token = mongoose.model('Token', tokenSchema);
export default Token;
