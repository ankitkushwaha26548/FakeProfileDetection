import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
const router = express.Router();

const {
  getAllActivities,
  getUserActivities,
  getActivityStats
} = require("../controllers/activityController");

// User routes
router.get("/me", auth, getUserActivities);

// Admin routes
router.get("/all", auth, admin, getAllActivities);
router.get("/stats", auth, admin, getActivityStats);

export default router;
