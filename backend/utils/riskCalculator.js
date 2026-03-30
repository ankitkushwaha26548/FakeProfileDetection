export default function riskCalculator({ activityScore, ipRisk, behaviorRisk, deviceRisk, accountAgeDays = 0 }) {
  let score = 0;
  let reasons = [];

  // Check if user is in grace period (new account < 3 days old)
  const isNewUser = accountAgeDays < 3;

  // Activity based risk
  if (activityScore > 70) {
    score += 10; // Reduced from 25
    reasons.push("❌ Abnormal activity rate");
  } else if (activityScore >= 0) {
    reasons.push("✅ Normal activity rate");
  }

  // IP risk
  if (ipRisk === "HIGH") {
    score += 10; // Reduced from 25
    reasons.push("❌ High-risk IP detected");
  } else if (ipRisk === "MEDIUM") {
    score += 5; // Reduced from 15
    reasons.push("⚠️ Suspicious IP pattern");
  } else {
    reasons.push("✅ Safe IP detected");
  }

  // Behavior risk (skip for new users)
  if (!isNewUser) {
    if (behaviorRisk === "HIGH") {
      score += 15; // Reduced from 30
      reasons.push("❌ Bot-like behavior detected");
    } else if (behaviorRisk === "MEDIUM") {
      score += 5; // Reduced from 15
      reasons.push("⚠️ Unusual behavior pattern");
    } else {
      reasons.push("✅ Normal user behavior");
    }
  }

  // Device risk (skip for new users)
  if (!isNewUser && deviceRisk === "HIGH") {
    score += 10; // Reduced from 20
    reasons.push("❌ Multiple device switching");
  } else if (!isNewUser) {
    reasons.push("✅ Consistent device usage");
  }

  // Classification with increased thresholds
  let level = "GENUINE";

  if (score >= 80) level = "FAKE"; // Increased threshold
  else if (score >= 50) level = "SUSPICIOUS"; // Increased from 40

  return {score, level, reasons};
}
