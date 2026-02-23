export default function riskCalculator({ activityScore, ipRisk, behaviorRisk, deviceRisk }) {
  let score = 0;
  let reasons = [];

  // Activity based risk
  if (activityScore > 70) {
    score += 25;
    reasons.push("Abnormal activity rate");
  }

  // IP risk
  if (ipRisk === "HIGH") {
    score += 25;
    reasons.push("High-risk IP detected");
  } else if (ipRisk === "MEDIUM") {
    score += 15;
    reasons.push("Suspicious IP pattern");
  }

  // Behavior risk
  if (behaviorRisk === "HIGH") {
    score += 30;
    reasons.push("Bot-like behavior detected");
  } else if (behaviorRisk === "MEDIUM") {
    score += 15;
    reasons.push("Unusual behavior pattern");
  }

  // Device risk
  if (deviceRisk === "HIGH") {
    score += 20;
    reasons.push("Multiple device switching");
  }

  // Classification
  let level = "GENUINE";

  if (score >= 70) level = "FAKE";
  else if (score >= 40) level = "SUSPICIOUS";

  return {score,level,reasons};
}
