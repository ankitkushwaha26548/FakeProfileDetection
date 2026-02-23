# Fake Account Detection System

## Overview
A full-stack web application for detecting fake social media accounts. It includes user registration/login, profile management, posting, and an admin dashboard for monitoring suspicious activity and flagging fake users.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS (port 5000)
- **Backend**: Express.js with MongoDB/Mongoose (port 3000)
- **Database**: MongoDB (requires MONGO_URI environment variable)

## Project Structure
```
backend/
  config/db.js          - MongoDB connection
  controllers/          - Route handlers (auth, admin, post, profile, detection, activity)
  middleware/            - Auth, admin, rate limiter, error handler
  models/               - Mongoose models (User, Post, Profile, Activity, LoginLog, RiskScore)
  routes/               - Express routes
  utils/                - Detection algorithms, activity logger, risk calculator
  server.js             - Entry point

frontend/
  src/
    api/                - Axios instances for API calls
    adminside/          - Admin dashboard components
    userside/           - User-facing components (login, register, feed, profile)
    components/         - Shared components
    pages/              - Page components
    services/           - API service layer
  vite.config.js        - Vite config with proxy to backend
```

## Environment Variables
- `MONGO_URI` - MongoDB connection string (required)
- `JWT_SECRET` - Secret for JWT token signing
- `PORT` - Backend port (defaults to 3000)

## Development
- Frontend dev server runs on port 5000 with Vite proxy forwarding `/api` requests to backend on port 3000
- Backend uses ES modules (`"type": "module"` in package.json)

## Recent Changes
- 2026-02-16: Initial Replit setup - fixed ESM/CJS mixing, middleware directory naming, import paths, port configuration, and Vite proxy setup
