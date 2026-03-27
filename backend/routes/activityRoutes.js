import express from "express";
import protect from '../middleware/authMiddleware.js';
import adminMiddleware from "../middleware/adminMiddleware.js";
import { createActivity, getActivityStats,getAllActivities,getUserActivities } from "../controllers/activityController.js";


const router = express.Router();

// User routes
router.post("/", protect, createActivity);
router.get("/me", protect, getUserActivities);

// Admin routes
router.get("/all", protect, adminMiddleware, getAllActivities);
router.get("/stats", protect, adminMiddleware, getActivityStats);

export default router;
