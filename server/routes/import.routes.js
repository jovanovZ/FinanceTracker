import express from 'express';
import protect from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.middleware.js';
import { parseCSV, confirmImport, getImportHistory } from '../controllers/importController.js';

const router = express.Router();

router.get('/history', protect, getImportHistory);
router.post('/csv', protect, upload.single('file'), parseCSV);
router.post('/confirm', protect, confirmImport);

export default router;
