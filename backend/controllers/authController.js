import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logActivity } from '../utils/activityLogger.js';
import runDetection from '../utils/fakeDetection.js';
import LoginLog from '../models/LoginLog.js';

// Register User
export const registerUser = async (req, res) => {
    try {
    const {name, email, password} = req.body;

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
        password: hashedPassword
    });

    //token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Login User
export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

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

        //token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'User logged in successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
        await LoginLog.create({
  user: user._id,
  ip: req.ip,
  userAgent: req.headers["user-agent"],
  device: req.headers["user-agent"], // simple parse
  location: "Unknown" // can integrate geoIP later
});

        await runDetection(user._id);

        await logActivity(user._id, "LOGIN", null, {
                ip: req.ip,
                userAgent: req.headers['user-agent']
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};