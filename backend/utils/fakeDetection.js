// fakeDetection.js

import Profile from '../models/Profile.js';
import Activity from '../models/Activity.js';
import RiskScore from '../models/RiskScore.js';
import LoginLog from '../models/LoginLog.js';
import riskCalculator from './riskCalculator.js';

const runDetection = async (userId) => {
  try {
    // Optimized: Fetch all data in parallel to reduce DB calls
    const [profile, totalActivities, logins, recentActivities] = await Promise.all([
      Profile.findOne({ user: userId }),
      Activity.countDocuments({ user: userId }),
      LoginLog.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
      Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(50)
    ]);

    let score = 0;
    let reasons = [];

    // 1. ACCOUNT AGE (grace period for new users)
    const accountAgeDays = (Date.now() - new Date(profile?.createdAt || Date.now())) / (1000 * 60 * 60 * 24);
    const isNewUser = accountAgeDays < 3;

    // 2. PROFILE COMPLETENESS (skip for new users)
    if (!isNewUser) {
      if (!profile || (profile.profileCompleteness || 0) < 50) {
        score += 8; // Balanced weight
        reasons.push("❌ Incomplete profile");
      } else {
        reasons.push("✅ Complete profile");
      }
    }

    // 3. ACTIVITY COUNT
    if (totalActivities < 3) {
      score += 4; // Balanced weight
      reasons.push("❌ Very low activity");
    } else if (totalActivities <= 50) {
      reasons.push("✅ Normal activity level");
    } else if (!isNewUser) {
      score += 4; // Balanced weight
      reasons.push("❌ Unusual high activity");
    }

    // 4. LOGIN FREQUENCY (skip for new users)
    if (logins.length >= 5 && !isNewUser) {
      const timeDiff = new Date(logins[0].createdAt) - new Date(logins[4].createdAt);
      if (timeDiff < 10 * 60 * 1000) {
        score += 8; // Balanced weight
        reasons.push("❌ High login frequency (bot-like)");
      } else {
        reasons.push("✅ Normal login frequency");
      }
    }

    // 5. IP PATTERN
    const recentIPs = logins.map(log => log.ip);
    const uniqueIPs = [...new Set(recentIPs)];

    if (uniqueIPs.length >= 3 && !isNewUser) {
      score += 8; // Balanced weight
      reasons.push("❌ Frequent IP changes");
    } else if (uniqueIPs.length > 0) {
      reasons.push("✅ Consistent IP usage");
    }

    // 6. NEW ACCOUNT HIGH ACTIVITY
    if (accountAgeDays < 2 && totalActivities > 20) {
      score += 8; // Balanced weight
      reasons.push("❌ New account with high activity");
    }

    if (accountAgeDays >= 7) {
      reasons.push("✅ Established account");
    }

    // 7. BEHAVIOR ANALYSIS (skip for new users)
    let behaviorRisk = "LOW";

    if (recentActivities.length >= 10 && !isNewUser) {
      let rapidActions = 0;
      for (let i = 0; i < recentActivities.length - 1; i++) {
        const diff = new Date(recentActivities[i].createdAt) - new Date(recentActivities[i + 1].createdAt);
        if (diff < 2000) rapidActions++;
      }

      if (rapidActions >= 10) {
        score += 10; // Balanced weight
        behaviorRisk = "HIGH";
        reasons.push("❌ Bot-like rapid actions");
      } else if (rapidActions >= 5) {
        score += 5; // Balanced weight
        behaviorRisk = "MEDIUM";
        reasons.push("⚠️ Some rapid actions");
      } else {
        reasons.push("✅ Natural timing");
      }

      // Repetitive pattern
      const types = recentActivities.map(a => a.type);
      const sameActions = types.filter(t => t === types[0]).length;
      if (sameActions >= 15) {
        score += 8; // Balanced weight
        behaviorRisk = "HIGH";
        reasons.push("❌ Repetitive actions");
      } else {
        reasons.push("✅ Varied actions");
      }
    }

    // 8. Prepare inputs for riskCalculator
    const activityScore = Math.min((totalActivities / 100) * 100, 100);
    const ipRisk = uniqueIPs.length >= 3 ? "HIGH" : (uniqueIPs.length === 2 ? "MEDIUM" : "LOW");
    const deviceRisk = uniqueIPs.length >= 5 ? "HIGH" : "LOW";

    const calc = riskCalculator({
      activityScore,
      ipRisk,
      behaviorRisk,
      deviceRisk,
      accountAgeDays
    });

    // 9. FINAL SCORE (weighted average)
    const finalScore = Math.round((score + calc.score) / 2);

    // 10. NEW USER CAP: Prevent FAKE for new users
    const cappedScore = isNewUser ? Math.min(finalScore, 39) : finalScore;

    // 11. FINAL LEVEL with updated thresholds
    let finalLevel = "GENUINE";
    if (cappedScore >= 40) finalLevel = "FAKE";
    else if (cappedScore >= 25) finalLevel = "SUSPICIOUS";

    // 12. OVERRIDE RULE: Smart detection for high-risk combos
    if (behaviorRisk === "HIGH" && ipRisk === "HIGH") {
      finalLevel = "FAKE";
      reasons.push("🚨 Override: Bot + High-risk IP");
    }

    // 13. MERGE REASONS (deduplicate)
    const finalReasons = [...new Set([...reasons, ...calc.reasons])];

    // 14. SAVE/UPDATE RISK SCORE
    let risk = await RiskScore.findOne({ user: userId });
    if (!risk) {
      risk = await RiskScore.create({
        user: userId,
        score: cappedScore,
        level: finalLevel,
        reasons: finalReasons,
        accountAgeDays
      });
    } else {
      risk.score = cappedScore;
      risk.level = finalLevel;
      risk.reasons = finalReasons;
      risk.accountAgeDays = accountAgeDays;
      risk.lastUpdated = new Date();
      await risk.save();
    }

    return risk;

  } catch (error) {
    console.error("Detection error:", error.message);
    return null;
  }
};

export default runDetection;
