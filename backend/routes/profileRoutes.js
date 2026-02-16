import express from 'express';
import auth from '../middleware/auth.js';
import { getMyProfile, createOrUpdateProfile } from '../controllers/profileController';

const router = express.Router();

router.post('/', auth, createOrUpdateProfile);
router.get('/me', auth, getMyProfile);

export default router;
