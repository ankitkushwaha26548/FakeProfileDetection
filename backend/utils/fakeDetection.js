import Profile from '../models/Profile.js';
import Activity from '../models/Activity.js';
import RiskScore from '../models/RiskScore.js';
import LoginLog from '../models/LoginLog.js';
import riskCalculator from './riskCalculator.js';

const runDetection = async (userId) => {
    try {
        let score = 0;
        let reasons = [];

        // 1. ACCOUNT AGE (important for grace period)
        const profile = await Profile.findOne({ user: userId });
        const accountAgeDays =
            (Date.now() - new Date(profile?.createdAt || Date.now())) /
            (1000 * 60 * 60 * 24);

        const isNewUser = accountAgeDays < 3;

        // 2. PROFILE COMPLETENESS
        if (!isNewUser) { // Skip for new users
            if (!profile || (profile.profileCompleteness || 0) < 50) {
                score += 10; // Reduced from 20
                reasons.push("❌ Incomplete profile");
            } else {
                reasons.push("✅ Complete profile");
            }
        }

        // 3. ACTIVITY BEHAVIOR
        const totalActivities = await Activity.countDocuments({ user: userId });

        if (totalActivities < 3) {
            score += 5; // Reduced from 15
            reasons.push("❌ Very low activity");
        } else if (totalActivities <= 50) {
            reasons.push("✅ Normal activity level");
        }

        if (totalActivities > 50 && !isNewUser) {
            score += 5; // Reduced from 15
            reasons.push("❌ Unusual high activity");
        }

        // 4. LOGIN FREQUENCY
        const logins = await LoginLog.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(10);

        let hasNormalLoginFrequency = true;
        if (logins.length >= 5 && !isNewUser) {
            const timeDiff =
                new Date(logins[0].createdAt) -
                new Date(logins[4].createdAt);

            if (timeDiff < 10 * 60 * 1000) {
                score += 10; // Reduced from 25
                reasons.push("❌ High login frequency (bot-like)");
                hasNormalLoginFrequency = false;
            }
        }
        
        if (hasNormalLoginFrequency && logins.length > 0) {
            reasons.push("✅ Normal login frequency");
        }

        // 5. IP CHANGE PATTERN
        const recentIPs = logins.map(log => log.ip);
        const uniqueIPs = [...new Set(recentIPs)];

        if (uniqueIPs.length >= 3 && !isNewUser) {
            score += 10; // Reduced from 20
            reasons.push("❌ Frequent IP changes");
        } else if (uniqueIPs.length >= 1) {
            reasons.push("✅ Consistent IP usage");
        }

        // 6. NEW ACCOUNT WITH HIGH ACTIVITY (now more lenient)
        if (accountAgeDays < 2 && totalActivities > 20) { // Changed from 10 to 20
            score += 10; // Reduced from 25
            reasons.push("❌ New account with very high activity");
        } else if (accountAgeDays >= 7) {
            reasons.push("✅ Established account");
        }

        // FINAL CLASSIFICATION with increased thresholds
        let level = "GENUINE";
        if (score >= 70) level = "FAKE"; // Increased from 60
        else if (score >= 50) level = "SUSPICIOUS"; // Increased from 30

        // Get behavior risk from anomaly detector for combined scoring
        let behaviorRisk = "LOW";
        const activities = await Activity.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50);

        if (activities.length >= 10) {
            let rapidActions = 0;
            for (let i = 0; i < activities.length - 1; i++) {
                const diff = new Date(activities[i].createdAt) - new Date(activities[i + 1].createdAt);
                if (diff < 2000) rapidActions++;
            }
            if (rapidActions >= 10) {
                behaviorRisk = "HIGH";
                reasons.push("❌ Rapid/bot-like actions detected");
            }
            else if (rapidActions >= 5) {
                behaviorRisk = "MEDIUM";
                reasons.push("⚠️ Some rapid actions detected");
            } else {
                reasons.push("✅ Natural action timing");
            }

            const types = activities.map(a => a.type);
            const sameActions = types.filter(t => t === types[0]).length;
            if (sameActions >= 15) {
                behaviorRisk = "HIGH";
                reasons.push("❌ Repetitive action pattern");
            } else {
                reasons.push("✅ Varied action types");
            }
        } else if (activities.length > 0) {
            reasons.push("✅ Normal behavior pattern");
        }

        // Calculate activity score for riskCalculator
        const activityScore = (totalActivities / 100) * 100;
        
        // MERGE: Combine with riskCalculator for unified score
        const ipRisk = uniqueIPs.length >= 3 ? "HIGH" : (uniqueIPs.length >= 2 ? "MEDIUM" : "LOW");
        const deviceRisk = uniqueIPs.length >= 5 ? "HIGH" : "LOW";
        
        const calculatedRisk = riskCalculator({
            activityScore: Math.min(activityScore, 100),
            ipRisk,
            behaviorRisk,
            deviceRisk,
            accountAgeDays
        });

        // Combine scores: use the higher risk level
        const finalScore = Math.max(score, calculatedRisk.score);
        const mergedReasons = [...new Set([...reasons, ...calculatedRisk.reasons])];
        
        let finalLevel = level;
        if (calculatedRisk.level === "FAKE" || level === "FAKE") {
            finalLevel = "FAKE";
        } else if (calculatedRisk.level === "SUSPICIOUS" || level === "SUSPICIOUS") {
            finalLevel = "SUSPICIOUS";
        }

        // SAVE / UPDATE
        let risk = await RiskScore.findOne({ user: userId });

        if (!risk) {
            risk = await RiskScore.create({
                user: userId,
                score: finalScore,
                level: finalLevel,
                reasons: mergedReasons,
                accountAgeDays
            });
        } else {
            risk.score = finalScore;
            risk.level = finalLevel;
            risk.reasons = mergedReasons;
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
