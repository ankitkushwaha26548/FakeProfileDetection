import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { createPost, likePost, commentOnPost, getFeed } from '../controllers/postController.js';

const router = express.Router();

router.post('/', protect, createPost);
router.get('/', protect, getFeed);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentOnPost);

export default router;