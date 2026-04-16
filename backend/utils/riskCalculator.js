export default function riskCalculator({
  behaviorRisk,
  deviceRisk,
  accountAgeDays = 0
}) {
  let score = 0;
  let reasons = [];

  const isNewUser = accountAgeDays < 3;

  // 1. BEHAVIOR (Weight: 20)
  if (!isNewUser) {
    if (behaviorRisk === "HIGH") {
      score += 20;
      reasons.push("Bot-like behavior");
    } else if (behaviorRisk === "MEDIUM") {
      score += 10;
      reasons.push("Unusual behavior");
    } else {
      reasons.push("Normal behavior");
    }
  }

  // 2. DEVICE (Weight: 10)
  if (!isNewUser) {
    if (deviceRisk === "HIGH") {
      score += 10;
      reasons.push("Multiple device usage");
    } else {
      reasons.push("Stable device usage");
    }
  }

  return { score, reasons };
}