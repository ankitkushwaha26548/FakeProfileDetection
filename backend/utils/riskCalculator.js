// riskCalculator.js

export default function riskCalculator({
  activityScore,
  ipRisk,
  behaviorRisk,
  deviceRisk,
  accountAgeDays = 0
}) {
  let score = 0;
  let reasons = [];

  const isNewUser = accountAgeDays < 3;

  // 1. ACTIVITY RISK (increased threshold for less sensitivity)
  if (activityScore > 85) {
    score += 10;
    reasons.push("❌ Abnormal activity rate");
  } else {
    reasons.push("✅ Normal activity rate");
  }

  // 2. IP RISK
  if (ipRisk === "HIGH") {
    score += 10;
    reasons.push("❌ High-risk IP detected");
  } else if (ipRisk === "MEDIUM") {
    score += 5;
    reasons.push("⚠️ Suspicious IP pattern");
  } else {
    reasons.push("✅ Safe IP detected");
  }

  // 3. BEHAVIOR RISK (skip for new users)
  if (!isNewUser) {
    if (behaviorRisk === "HIGH") {
      score += 15;
      reasons.push("❌ Bot-like behavior detected");
    } else if (behaviorRisk === "MEDIUM") {
      score += 5;
      reasons.push("⚠️ Unusual behavior pattern");
    } else {
      reasons.push("✅ Normal user behavior");
    }
  }

  // 4. DEVICE RISK (skip for new users)
  if (!isNewUser) {
    if (deviceRisk === "HIGH") {
      score += 10;
      reasons.push("❌ Multiple device switching");
    } else {
      reasons.push("✅ Consistent device usage");
    }
  }

  // 5. CLASSIFICATION with updated thresholds
  let level = "GENUINE";
  if (score >= 40) level = "FAKE";
  else if (score >= 25) level = "SUSPICIOUS";

  return { score, level, reasons };
}
