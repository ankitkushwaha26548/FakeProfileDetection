import User from "../models/User.js";
import RiskScore from "../models/RiskScore.js";
import Activity from "../models/Activity.js";
import LoginLog from "../models/LoginLog.js";

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalActivities = await Activity.countDocuments();

    const genuine = await RiskScore.countDocuments({ level: "GENUINE" });
    const suspicious = await RiskScore.countDocuments({ level: "SUSPICIOUS" });
    const fake = await RiskScore.countDocuments({ level: "FAKE" });

    res.json({
      totalUsers,
      totalActivities,
      genuine,
      suspicious,
      fake
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users with risk
export const getUsersWithRisk = async (req, res) => {
  try {
    const risks = await RiskScore.find()
      .populate("user", "name email role");

    res.json(risks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get fake users only
export const getFakeUsers = async (req, res) => {
  try {
    const fakeUsers = await RiskScore.find({ level: "FAKE" })
      .populate("user", "name email");

    res.json(fakeUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get suspicious users only
export const getSuspiciousUsers = async (req, res) => {
  try {
    const suspiciousUsers = await RiskScore.find({ level: "SUSPICIOUS" })
      .populate("user", "name email");

    res.json(suspiciousUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login log monitoring
export const getLoginLogs = async (req, res) => {
  try {
    const logs = await LoginLog.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Flag user manually
export const flagUser = async (req, res) => {
  try {
    const risk = await RiskScore.findOne({ user: req.params.userId });

    if (!risk) {
      return res.status(404).json({ message: "Risk profile not found" });
    }

    risk.level = "FAKE";
    risk.score = 100;
    risk.reasons.push("Manually flagged by admin");
    await risk.save();

    res.json({ message: "User flagged as FAKE" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};