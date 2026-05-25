import express from 'express';
import errorHandler from '../middleware/errorMiddleware.js';
import protect  from '../middleware/authMiddleware.js';
import BudgetController from '../controllers/budgetController.js';

const router = express.Router();
router.use(protect); 

router.get("/", BudgetController.getAllBudgets);
router.get("/current", BudgetController.getCurrentMonthBudgets);
router.post("/", BudgetController.insertNewBudget);
router.put("/:id", BudgetController.updateBudget);
router.delete("/:id", BudgetController.deleteBudget);
router.get("/report/:month", BudgetController.getBudgetReport);
router.get("/suggestions", BudgetController.getBudgetSuggestions);

export default router;