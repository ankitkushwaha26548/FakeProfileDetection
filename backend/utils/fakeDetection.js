import Profile from '../models/Profile.js';
import Activity from '../models/Activity.js';
import RiskScore from '../models/RiskScore.js';
import LoginLog from '../models/LoginLog.js';
import User from '../models/User.js';
import riskCalculator from './riskCalculator.js';
import profileCompleteness from './profileCompleteness.js';

const runDetection = async (userId) => {
  try {
    let score = 0;
    let reasons = [];

    const [profile, totalActivities, logins, recentActivities, user] = await Promise.all([
      Profile.findOne({ user: userId }),
      Activity.countDocuments({ user: userId }),
      LoginLog.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
      Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(50),
      User.findById(userId)
    ]);

    // 1. ACCOUNT AGE
    const accountAgeDays =
      (Date.now() - new Date(user?.createdAt || Date.now())) /
      (1000 * 60 * 60 * 24);

    const isNewUser = accountAgeDays < 3;

    
    // 2. PROFILE
    const completeness = profileCompleteness(profile);
    if (!profile || completeness < 50) {
      score += 15;
      reasons.push("Incomplete profile");
    } else {
      reasons.push("Complete profile");
    }

    // 3. ACTIVITY
    if (totalActivities === 0) {
      score += 15;
      reasons.push("No activity");
    } else if (totalActivities > 50 && isNewUser) {
      score += 15;
      reasons.push("New account high activity");
    } else if (totalActivities > 60) {
      score += 10;
      reasons.push("Very high activity");
    } else {
      reasons.push("Normal activity");
    }

    // 4. LOGIN
    if (logins.length >= 5 && !isNewUser) {
      const diff =
        new Date(logins[0].createdAt) -
        new Date(logins[4].createdAt);

      if (diff < 10 * 60 * 1000) {
        score += 10;
        reasons.push("Frequent login");
      } else {
        reasons.push("Normal login");
      }
    }

    //new user + login
    if (isNewUser && logins.length >= 5) {
    score += 10;
    reasons.push("New account with multiple logins");
    }

    // 5. IP
    const uniqueIPs = [...new Set(logins.map(l => l.ip))];

    if (uniqueIPs.length >= 3) {
      score += 15;
      reasons.push("Multiple IP changes");
    } else {
      reasons.push("Stable IP");
    }

    
    // IP RISK + Login
    if (logins.length >= 5 && uniqueIPs.length >= 3) {
    score += 15;
    reasons.push("Multiple logins from different IPs");
    }

    // 6. BEHAVIOR
    let behaviorRisk = "LOW";

    if (recentActivities.length >= 10 && !isNewUser) {
      let rapid = 0;

      for (let i = 0; i < recentActivities.length - 1; i++) {
        const diff =
          new Date(recentActivities[i].createdAt) -
          new Date(recentActivities[i + 1].createdAt);

        if (diff < 5000) rapid++;
      }

      if (rapid >= 10) behaviorRisk = "HIGH";
      else if (rapid >= 5) behaviorRisk = "MEDIUM";
    }

    // 7. DEVICE
    const deviceRisk = uniqueIPs.length >= 5 ? "HIGH" : "LOW";

    // 8. ADVANCED ENGINE
    const calc = riskCalculator({
      behaviorRisk,
      deviceRisk,
      accountAgeDays
    });

    score += calc.score;
    reasons = [...new Set([...reasons, ...calc.reasons])];

    if (behaviorRisk === "HIGH" && uniqueIPs.length >= 3) {
      score += 20;
      reasons.push("Bot + IP risk combo");
    }

    if (totalActivities === 0 && accountAgeDays > 10) {
      score += 15;
      reasons.push("Inactive old account");
    }

    // 9. CONFIDENCE
    const confidence = Math.min(score, 100);

    // 10. FINAL LEVEL
    let finalLevel = "GENUINE";

    if (score >= 60) finalLevel = "FAKE";
    else if (score >= 30) finalLevel = "SUSPICIOUS";

    console.log({
      userId,score,behaviorRisk,deviceRisk,totalActivities,uniqueIPs: uniqueIPs.length,accountAgeDays,
      finalLevel,reasons
    });

    return await saveResult(
      userId,
      score,
      finalLevel,
      reasons,
      accountAgeDays,
      confidence
    );

  } catch (error) {
    console.error("Detection error:", error.message);
    return null;
  }
};

const saveResult = async (userId, score, level, reasons, accountAgeDays, confidence) => {
  let risk = await RiskScore.findOne({ user: userId });

  if (!risk) {
    return await RiskScore.create({
      user: userId,
      score,
      level,
      reasons,
      accountAgeDays,
      confidence
    });
  } else {
    risk.score = score;
    risk.level = level;
    risk.reasons = reasons;
    risk.accountAgeDays = accountAgeDays;
    risk.confidence = confidence;
    risk.lastUpdated = new Date();
    return await risk.save();
  }
};

export default runDetection;