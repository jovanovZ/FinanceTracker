import express from 'express';
import { getDashboard, getOverview } from '../controllers/analyticsController.js';
import protect from '../middleware/authMiddleware.js';
import errorMiddleware from '../middleware/errorMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);

router.use(errorMiddleware);

export default router;
