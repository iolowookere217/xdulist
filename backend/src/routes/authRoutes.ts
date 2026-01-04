import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  getCurrentUser,
  googleAuth,
  verifyEmail,
  resendVerification
} from '../controllers/authController';
import { validate, RegisterSchema, LoginSchema } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validate(RegisterSchema), register);
router.post('/login', validate(LoginSchema), login);
router.post('/google', googleAuth);
router.post('/refresh', refresh);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

export default router;
