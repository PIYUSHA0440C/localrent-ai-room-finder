import User from '../models/User.js';
import { TRUST_BADGES } from '../config/constants.js';

class TrustService {
  // Calculate trust score for a user
  calculateScore(user) {
    let score = 0;

    // Email verified: 15 points
    if (user.isEmailVerified) score += 15;

    // Profile complete: 10 points
    if (user.name && user.phone && user.city && user.bio) score += 10;

    // Completed bookings: up to 25 points (5 per booking, max 5)
    score += Math.min(user.completedBookings * 5, 25);

    // Average rating: up to 50 points (rating * 10)
    if (user.averageRating > 0) {
      score += Math.min(Math.round(user.averageRating * 10), 50);
    }

    return Math.min(score, 100);
  }

  // Determine trust badge from score
  getBadge(score) {
    if (score >= 71) return TRUST_BADGES.VERIFIED;
    if (score >= 46) return TRUST_BADGES.TRUSTED;
    if (score >= 21) return TRUST_BADGES.RISING;
    return TRUST_BADGES.NEW;
  }

  // Update a user's trust score and badge
  async updateTrustScore(userId) {
    const user = await User.findById(userId);
    if (!user) return;

    const score = this.calculateScore(user);
    const badge = this.getBadge(score);

    user.trustScore = score;
    user.trustBadge = badge;
    await user.save();

    return { trustScore: score, trustBadge: badge };
  }

  // Recalculate all users' trust scores (for admin / cron)
  async recalculateAll() {
    const users = await User.find({});
    let updated = 0;

    for (const user of users) {
      const score = this.calculateScore(user);
      const badge = this.getBadge(score);

      if (user.trustScore !== score || user.trustBadge !== badge) {
        user.trustScore = score;
        user.trustBadge = badge;
        await user.save();
        updated++;
      }
    }

    return { total: users.length, updated };
  }
}

export default new TrustService();
