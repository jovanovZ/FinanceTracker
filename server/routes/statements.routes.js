import express from 'express'
import { getMonthlyReport, getAnnualReport, exportCSV } from '../controllers/statementsController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.get('/monthly', getMonthlyReport)
router.get('/annual', getAnnualReport)
router.get('/export/csv', exportCSV)

export default router