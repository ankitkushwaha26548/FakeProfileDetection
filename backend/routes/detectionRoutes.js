import express from 'express';
import protect from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { runDetectionForUser, getMyRisk, getAllRiskyUsers } from '../controllers/detectionContoller.js';

const router = express.Router();

router.get('/me', protect, getMyRisk);
router.post('/scan/:userId', protect, adminMiddleware, runDetectionForUser);
router.get('/all', protect, adminMiddleware, getAllRiskyUsers);

export default router;
