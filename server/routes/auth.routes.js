import express from 'express';
import { login, register, logout, getMe, completeOnboarding, changePassword, getSessions, terminateSession } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.patch('/onboarding', protect, completeOnboarding);
router.post('/change-password', protect, changePassword);
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:id', protect, terminateSession);

export default router;
