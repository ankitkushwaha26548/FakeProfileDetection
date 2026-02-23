import express from 'express';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

import { createPost, likePost, commentOnPost, getFeed } from '../controllers/postController.js';

router.post('/', protect, createPost);
router.get('/', protect, getFeed);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentOnPost);

export default router;