import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logActivity } from '../utils/activityLogger.js';
import runDetection from '../utils/fakeDetection.js';
import LoginLog from '../models/LoginLog.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'FPDFPDFPDFPD';

const createLoginLog = async (userId, req) => LoginLog.create({
  user: userId,
  ip: req.ip ?? '127.0.0.1',
  userAgent: req.headers['user-agent'] ?? 'unknown',
  device: req.headers['user-agent'] ?? 'unknown',
  location: 'Unknown'
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Please provide name, email and password' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: email.endsWith('@admin.com') ? 'admin' : 'user'
    });

    Promise.all([
      createLoginLog(user._id, req),
      runDetection(user._id),
      logActivity(user._id, 'REGISTER', null, { ip: req.ip, userAgent: req.headers['user-agent'] })
    ]).catch(err => console.error('Post-registration tasks failed:', err.message));

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: 'Your account has been blocked',
        reason: user.blockReason ?? 'Your account has been blocked',
        blockedAt: user.blockedAt,
        isBlocked: true
      });
    }

    Promise.all([
      createLoginLog(user._id, req),
      runDetection(user._id),
      logActivity(user._id, 'LOGIN', null, { ip: req.ip, userAgent: req.headers['user-agent'] })
    ]).catch(err => console.error('Post-login tasks failed:', err.message));

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'User logged in successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyLoginLogs = async (req, res) => {
  try {
    const logs = await LoginLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};