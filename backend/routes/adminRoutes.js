import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";


const router = express.Router();
const {
  getDashboardStats,
  getUsersWithRisk,
  getFakeUsers,
  getSuspiciousUsers,
  getLoginLogs,
  flagUser
} = require("../controllers/adminController");

router.get("/stats", auth, admin, getDashboardStats);
router.get("/users", auth, admin, getUsersWithRisk);
router.get("/fake", auth, admin, getFakeUsers);
router.get("/suspicious", auth, admin, getSuspiciousUsers);
router.get("/logs", auth, admin, getLoginLogs);
router.post("/flag/:userId", auth, admin, flagUser);

export default router;
