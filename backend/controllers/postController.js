import Post from '../models/Post.js';
import RiskScore from '../models/RiskScore.js';
import { logActivity } from '../utils/activityLogger.js';
import runDetection from '../utils/fakeDetection.js';

// Create a new post
export const createPost = async (req, res) => {
    try {
        const post = await Post.create({
        user: req.user._id,
        content: req.body.content
    });

    await logActivity(req.user._id, "POST", post._id);
    await runDetection(req.user._id);

    res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Like Post
export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post.likes.includes(req.user._id)) {
            post.likes.push(req.user._id);
            await post.save();

            await logActivity(req.user._id, "LIKE_POST", post._id);
            await runDetection(req.user._id);
        }

        res.json(post);
    }  catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Comment on Post
export const commentOnPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        post.comments.push({
            user: req.user._id,
            text: req.body.text
        });

        await post.save();

        await logActivity(req.user._id, "COMMENT", post._id);
        await runDetection(req.user._id);

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Feed (with risk level per user)
export const getFeed = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name')
            .populate('comments.user', 'name')
            .sort({ createdAt: -1 })
            .lean();
        const userIds = [...new Set(posts.map((p) => p.user?._id).filter(Boolean))];
        const risks = await RiskScore.find({ user: { $in: userIds } }).lean();
        const riskByUser = Object.fromEntries(risks.map((r) => [String(r.user), r.level]));
        const postsWithRisk = posts.map((p) => ({
            ...p,
            user: p.user ? { ...p.user, riskLevel: riskByUser[String(p.user._id)] || 'GENUINE' } : p.user,
        }));
        res.json(postsWithRisk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

