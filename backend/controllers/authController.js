import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logActivity } from '../utils/activityLogger.js';
import runDetection from '../utils/fakeDetection.js';
import LoginLog from '../models/LoginLog.js';

const JWT_SECRET = process.env.JWT_SECRET || 'FPDFPDFPDFPD';

// Register User
export const registerUser = async (req, res) => {
    try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    //check if user exists
    let user = await User.findOne({ email });
    if(user) {
        return res.status(400).json({ message: 'User already exists' });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create user
    user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: email.endsWith('@admin.com') ? 'admin' : 'user'
    });

    try {
        await LoginLog.create({
            user: user._id,
            ip: req.ip || '127.0.0.1',
            userAgent: req.headers["user-agent"] || 'unknown',
            device: req.headers["user-agent"] || 'unknown',
            location: "Unknown"
        });
        await runDetection(user._id);
        await logActivity(user._id, "REGISTER", null, {
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });
    } catch (err) {
        console.error("Post-registration tasks failed:", err.message);
        // We don't want to fail registration if these secondary tasks fail
    }

    //token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        //check if user exists
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        //check password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Run side effects before sending response (so we don't double-send on error)
        try {
            await LoginLog.create({
                user: user._id,
                ip: req.ip || '127.0.0.1',
                userAgent: req.headers["user-agent"] || 'unknown',
                device: req.headers["user-agent"] || 'unknown',
                location: "Unknown"
            });
            await runDetection(user._id);
            await logActivity(user._id, "LOGIN", null, {
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });
        } catch (err) {
            console.error("Post-login tasks failed:", err.message);
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'User logged in successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get current user (protected)
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get current user's login logs (protected)
export const getMyLoginLogs = async (req, res) => {
    try {
        const logs = await LoginLog.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};