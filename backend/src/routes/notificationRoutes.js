import { Router } from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;
