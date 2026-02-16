import express from 'express';
import auth from '../middleware/auth.js';
import { runDetectionForUser, getMyRisk, getAllRiskyUsers } from '../controllers/detectionContoller';

const router = express.Router();

//user 
router.get("/me", auth, getMyRisk);

//admin manual scan 
router.post("/scan/:userId", auth, runDetectionForUser);

//admin dashboard
router.get("/all", auth, getAllRiskyUsers);

export default router;
