import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { registerUser, loginUser, getMe, getMyLoginLogs } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/login-logs', protect, getMyLoginLogs);

export default router;