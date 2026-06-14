import Notification from '../models/Notification.js';

class NotificationService {
  // Create a notification
  async createNotification({ user, type, title, message, relatedBooking, relatedListing }) {
    const notification = await Notification.create({
      user,
      type,
      title,
      message,
      relatedBooking,
      relatedListing,
    });

    return notification;
  }

  // Get user's notifications
  async getUserNotifications(userId, query = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { user: userId };
    if (unreadOnly === 'true') filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: userId, isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  // Get unread count (for polling)
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({ user: userId, isRead: false });
    return count;
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    return notification;
  }

  // Mark all as read
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
  }
}

export default new NotificationService();
