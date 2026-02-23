import Activity from "../models/Activity.js";

// Get all activities (admin)
export const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user activities
export const getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Activity stats (for dashboard)
export const getActivityStats = async (req, res) => {
  try {
    const total = await Activity.countDocuments();
    const posts = await Activity.countDocuments({ type: "POST" });
    const likes = await Activity.countDocuments({ type: "LIKE_POST" });
    const comments = await Activity.countDocuments({ type: "COMMENT" });
    const logins = await Activity.countDocuments({ type: "LOGIN" });

    res.json({
      total,
      posts,
      likes,
      comments,
      logins
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
