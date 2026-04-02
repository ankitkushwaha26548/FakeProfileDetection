import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getDashboardStats, getUsersWithRisk, getFakeUsers, getSuspiciousUsers, getLoginLogs, flagUser } from "../controllers/adminController.js";

const router = express.Router();

// Role-based access control: only admins can access these routes
router.use(protect);
router.use(authorize('admin'));
router.get("/stats", getDashboardStats);
router.get("/users", getUsersWithRisk);
router.get("/fake", getFakeUsers);
router.get("/suspicious", getSuspiciousUsers);
router.get("/logs", getLoginLogs);
router.post("/flag/:userId", flagUser);

export default router;
