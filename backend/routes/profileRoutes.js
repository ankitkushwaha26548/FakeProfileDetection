import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { getMyProfile, createOrUpdateProfile } from '../controllers/profileController.js';

const router = express.Router();

router.post('/', protect, createOrUpdateProfile);
router.put('/update', protect, createOrUpdateProfile);
router.post('/upload', protect, createOrUpdateProfile);
router.get('/me', protect, getMyProfile);

export default router;
