import express from "express";

import {
  getUserProfile,
  updateUserProfile,
  updatePass,
} from "../controllers/profileController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route("/pass").put(protect, updatePass);

export default router;