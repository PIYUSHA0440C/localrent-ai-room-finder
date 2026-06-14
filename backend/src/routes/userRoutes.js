import { Router } from 'express';
import { updateProfile, updateAvatar, getPublicProfile, changePassword } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = Router();

router.put('/profile', authenticate, updateProfile);
router.put('/avatar', authenticate, uploadAvatar.single('avatar'), updateAvatar);
router.put('/change-password', authenticate, changePassword);
router.get('/:id', getPublicProfile);

export default router;
