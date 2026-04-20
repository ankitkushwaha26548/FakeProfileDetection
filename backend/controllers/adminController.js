import User from "../models/User.js";
import RiskScore from "../models/RiskScore.js";
import Activity from "../models/Activity.js";
import LoginLog from "../models/LoginLog.js";

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
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
      .populate({
        path: "user",
        select: "name email role isBlocked blockReason blockedAt",
        match: { role: { $ne: 'admin' } }
      })
      .then(risks => risks.filter(risk => risk.user !== null)); // Remove risks where user was filtered out

    res.json(risks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get fake users only
export const getFakeUsers = async (req, res) => {
  try {
    const fakeUsers = await RiskScore.find({ level: "FAKE" })
      .populate({
        path: "user",
        select: "name email",
        match: { role: { $ne: 'admin' } }
      })
      .then(risks => risks.filter(risk => risk.user !== null));

    res.json(fakeUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get suspicious users only
export const getSuspiciousUsers = async (req, res) => {
  try {
    const suspiciousUsers = await RiskScore.find({ level: "SUSPICIOUS" })
      .populate({
        path: "user",
        select: "name email",
        match: { role: { $ne: 'admin' } }
      })
      .then(risks => risks.filter(risk => risk.user !== null));

    res.json(suspiciousUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login log monitoring
export const getLoginLogs = async (req, res) => {
  try {
    const logs = await LoginLog.find()
      .populate({
        path: "user",
        select: "name email role"
      })
      .sort({ createdAt: -1 });

    // Filter out logs where user is null or user is admin
    const filteredLogs = logs.filter(log => log.user && log.user.role !== 'admin');

    res.json(filteredLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Flag user manually
export const flagUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: "Cannot flag admin users" });
    }

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

//block a user 
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    //Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //prevent blocking admins
    if (user.role === 'admin') {
      return res.status(403).json({ message: "Cannot block admin users" });
    }

    //check if already blocked
    if (user.isBlocked) {
      return res.status(400).json({ message: "User is already blocked" });
    }

    //block the user
    user.isBlocked = true;
    user.blockedAt = new Date();
    user.blockedBy = req.user._id; //Admin who blocked
    user.blockReason = reason || 'Fake account detected';
    await user.save();

    // Also update or create risk profile as FAKE
    const currentRisk = await RiskScore.findOne({ user: userId });
    if (currentRisk) {
      currentRisk.score = 100;
      currentRisk.level = "FAKE";
      currentRisk.reasons = [...currentRisk.reasons, "User blocked by admin"];
      await currentRisk.save();
    } else {
      await RiskScore.create({
        user: userId,
        score: 100,
        level: "FAKE",
        reasons: ["User blocked by admin"]
      });
    }

    res.status(200).json({
      message: "User blocked successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked, 
        blockedAt: user.blockedAt,
        blockReason: user.blockReason
      }
 });

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: error.message });
  }
}

// Unblock a user
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: "Cannot unblock admin users" });
    }

    if (!user.isBlocked) {
      return res.status(400).json({ message: "User is not blocked" });
    }

    user.isBlocked = false;
    user.blockedAt = null;
    user.blockedBy = null;
    user.blockReason = null;
    await user.save();

    res.status(200).json({ 
      message: "User unblocked successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked
      } 
    });

  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: error.message });
  }
};

//Get all blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const blockedUsers = await User.find({ isBlocked: true })
      .select('-password')
      .populate('blockedBy', 'name email')
      .sort({ blockedAt: -1 }); 

      res.status(200).json(
        {
          count: blockedUsers.length,
          data: blockedUsers
        }
      );

  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ message: error.message });
  }
};