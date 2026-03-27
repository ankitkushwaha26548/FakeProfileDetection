import Profile from '../models/Profile.js';
import Activity from '../models/Activity.js';
import RiskScore from '../models/RiskScore.js';
import LoginLog from '../models/LoginLog.js';

const runDetection = async (userId) => {
    try {
        let score = 0;
        let reasons = [];

        // 1. PROFILE COMPLETENESS

        const profile = await Profile.findOne({ user: userId });

        if (!profile || (profile.profileCompleteness || 0) < 50) {
            score += 20;
            reasons.push("Incomplete profile");
        }

        // 2. ACTIVITY BEHAVIOR
        const totalActivities = await Activity.countDocuments({ user: userId });

        if (totalActivities < 3) {
            score += 15;
            reasons.push("Very low activity");
        }

        if (totalActivities > 50) {
            score += 15;
            reasons.push("Unusual high activity");
        }

        // 3. LOGIN FREQUENCY
        const logins = await LoginLog.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(10);

        if (logins.length >= 5) {
            const timeDiff =
                new Date(logins[0].createdAt) -
                new Date(logins[4].createdAt);

            if (timeDiff < 10 * 60 * 1000) {
                score += 25;
                reasons.push("High login frequency (bot-like)");
            }
        }

        // 4. IP CHANGE PATTERN
        const recentIPs = logins.map(log => log.ip);
        const uniqueIPs = [...new Set(recentIPs)];

        if (uniqueIPs.length >= 3) {
            score += 20;
            reasons.push("Frequent IP changes");
        }

        // 5. ACCOUNT AGE
        const accountAgeDays =
            (Date.now() - new Date(profile?.createdAt || Date.now())) /
            (1000 * 60 * 60 * 24);

        if (accountAgeDays < 2 && totalActivities > 10) {
            score += 25;
            reasons.push("New account with high activity");
        }

        // FINAL CLASSIFICATION
        let level = "GENUINE";
        if (score >= 60) level = "FAKE";
        else if (score >= 30) level = "SUSPICIOUS";

        // SAVE / UPDATE
        let risk = await RiskScore.findOne({ user: userId });

        if (!risk) {
            risk = await RiskScore.create({
                user: userId,
                score,
                level,
                reasons
            });
        } else {
            risk.score = score;
            risk.level = level;
            risk.reasons = reasons;
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