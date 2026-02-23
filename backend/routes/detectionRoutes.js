import express from 'express';
import protect from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { runDetectionForUser, getMyRisk, getAllRiskyUsers } from '../controllers/detectionContoller.js';

const router = express.Router();

// User: get own risk
router.get("/me", protect, getMyRisk);

// Admin: manual scan and all risky users
router.post("/scan/:userId", protect, adminMiddleware, runDetectionForUser);
router.get("/all", protect, adminMiddleware, getAllRiskyUsers);

export default router;
