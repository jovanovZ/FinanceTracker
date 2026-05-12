import express from 'express';
const router = express.Router();
import protect from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.middleware.js';
import importCSV from '../controllers/importController.js';

router.post('/csv', upload.single('file'), importCSV);

export default router;