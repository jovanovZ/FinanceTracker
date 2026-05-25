import express from 'express';
import protect from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.middleware.js';
import importCSV from '../controllers/importController.js';

const router = express.Router();

router.post('/csv', protect, upload.single('file'), importCSV);

export default router;