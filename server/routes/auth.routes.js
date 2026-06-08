import express from 'express';
import { login, register, logout, getMe, completeOnboarding } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.patch('/onboarding', protect, completeOnboarding);

export default router;
