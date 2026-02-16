import Activity from '../models/Activity'

module.exports = async function anomalyDetector(userId) {
  const activities = await Activity.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50);

  let risk = "LOW";

  if (activities.length < 10) return risk;

  // Frequency analysis
  let rapidActions = 0;
  for (let i = 0; i < activities.length - 1; i++) {
    const diff = new Date(activities[i].createdAt) - new Date(activities[i + 1].createdAt);
    if (diff < 2000) rapidActions++; // actions within 2 seconds
  }

  if (rapidActions >= 10) {
    risk = "HIGH";
  } else if (rapidActions >= 5) {
    risk = "MEDIUM";
  }

  // Pattern detection (repetitive actions)
  const types = activities.map(a => a.type);
  const sameActions = types.filter(t => t === types[0]).length;

  if (sameActions >= 15) {
    risk = "HIGH";
  }

  return risk;
};
