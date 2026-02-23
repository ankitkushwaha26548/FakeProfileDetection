import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { getDashboardStats, getUsersWithRisk, getFakeUsers, getSuspiciousUsers, getLoginLogs, flagUser } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", protect, adminMiddleware, getDashboardStats);
router.get("/users", protect, adminMiddleware, getUsersWithRisk);
router.get("/fake", protect, adminMiddleware, getFakeUsers);
router.get("/suspicious", protect, adminMiddleware, getSuspiciousUsers);
router.get("/logs", protect, adminMiddleware, getLoginLogs);
router.post("/flag/:userId", protect, adminMiddleware, flagUser);

export default router;
