import notificationService from '../services/notificationService.js';

// GET /api/notifications
export const getNotifications = async (req, res) => {
  const result = await notificationService.getUserNotifications(req.user._id, req.query);
  res.json(result);
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  res.json({ unreadCount: count });
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  await notificationService.markAsRead(req.params.id, req.user._id);
  res.json({ message: 'Marked as read' });
};

// PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  res.json({ message: 'All notifications marked as read' });
};
