import { Router } from 'express';
import { register, login, refreshToken, logout, verifyEmail, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/verify-email/:token', verifyEmail);
router.get('/me', authenticate, getMe);

export default router;
