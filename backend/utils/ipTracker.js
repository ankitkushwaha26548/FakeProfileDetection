import LoginLog from '../models/LoginLog.js'


export default async function ipTracker(userId, ip) {
  const logs = await LoginLog.find({ user: userId }).sort({ createdAt: -1 }).limit(10);

  let risk = "LOW";

  // Multiple IPs in short time
  const uniqueIps = new Set(logs.map(l => l.ip));
  if (uniqueIps.size >= 5) {
    risk = "HIGH";
  } else if (uniqueIps.size >= 3) {
    risk = "MEDIUM";
  }

  // Rapid IP switching
  if (logs.length >= 3) {
    const timeDiff = new Date(logs[0].createdAt) - new Date(logs[2].createdAt);
    if (timeDiff < 5 * 60 * 1000) { // 5 minutes
      risk = "HIGH";
    }
  }

  return risk;
};
