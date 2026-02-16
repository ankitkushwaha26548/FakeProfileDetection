import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

import { createPost, likePost, commentOnPost, getFeed } from '../controllers/postController.js';

router.post('/', auth, createPost);
router.get('/', auth, getFeed);
router.post('/like/:id', auth, likePost);
router.post('/comment/:id', auth, commentOnPost);

export default router;