
import express from 'express';
import {
    getDashboardStats,
    getMonthlyTrends,
    getTopMerchants,
    getDailySpending,
    getInsights
} from '../controllers/analyticsController.js';

import protect from '../middleware/authMiddleware.js';
import errorMiddleware from '../middleware/errorMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/trends', getMonthlyTrends);
router.get('/top-merchants', getTopMerchants);
router.get('/daily-spending', getDailySpending);
router.get('/insights', getInsights);

router.use(errorMiddleware);

export default router;