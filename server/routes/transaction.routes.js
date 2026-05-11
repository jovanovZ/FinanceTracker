import express from 'express';
import {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
} from '../controllers/transactionController.js';

import protect  from '../middleware/authMiddleware.js';
import errorMiddleware from '../middleware/errorMiddleware.js'; 

const router = express.Router();

router.use(protect); 

router.route('/')
    .get(getTransactions)
    .post(createTransaction);

router.route('/:id')
    .patch(updateTransaction)
    .delete(deleteTransaction);

router.use(errorMiddleware);

export default router;