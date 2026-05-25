import express from "express";

import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../controllers/goalsController.js";

import protect from "../middleware/authMiddleware.js";
import errorMiddleware from '../middleware/errorMiddleware.js'; 

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getGoals)
  .post(createGoal);

router.route("/:id")
  .get(getGoalById)
  .patch(updateGoal)
  .delete(deleteGoal);
  
router.use(errorMiddleware);

export default router;