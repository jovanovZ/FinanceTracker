import express from 'express';
import CategoryController from '../controllers/categoryController.js';

import protect  from '../middleware/authMiddleware.js';
import errorMiddleware from '../middleware/errorMiddleware.js'; 

const router = express.Router();

router.use(protect); 

router.route('/')
    .get(CategoryController.list)
    .post(CategoryController.create);
router.route('/:id')
    .get(CategoryController.show)
    .patch(CategoryController.update)
    .delete(CategoryController.remove);
router.use(errorMiddleware);

export default router;