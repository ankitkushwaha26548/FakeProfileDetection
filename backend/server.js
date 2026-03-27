import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



dotenv.config();
connectDB();


const app = express();
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());


import { apiLimiter, authLimiter } from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import detectionRoutes from "./routes/detectionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Global limiter
app.use(apiLimiter);

// Auth limiter removed - allowing unlimited login attempts
app.use("/api/auth", authRoutes);

// Routes
app.use("/api/profile", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/detection", detectionRoutes);
app.use("/api/admin", adminRoutes);

// Error handler (must be last so it catches next(err) from routes)
app.use(errorHandler);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}


const PORT = process.env.PORT || 3000;
app.listen(PORT , 'localhost' , () => console.log(`Server running on port ${PORT}`));
