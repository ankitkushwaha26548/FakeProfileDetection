import Profile from '../models/Profile.js';
import Activity from '../models/Activity.js';
import RiskScore from '../models/RiskScore.js';
import LoginLog from '../models/LoginLog.js';

const runDetection = async (userId) => {
    try {
        let score = 0;
        let reasons = [];

        // Profile completeness
        const profile = await Profile.findOne({ user: userId });
        if (!profile || (profile.profileCompleteness || 0) < 40) {
            score += 20;
            reasons.push("Low profile completeness");
        }

        // Activity pattern
        const activities = await Activity.countDocuments({ user: userId });
        if (activities < 3) {
            score += 15;
            reasons.push("Very low activity");
        }

        // Login Frequency
        const logins = await Activity.find({ user: userId, type: 'LOGIN' })
            .sort({ createdAt: -1 })
            .limit(10);

        if (logins && logins.length > 5) {
            const lastLogin = logins[0].createdAt;
            const fifthLastLogin = logins[4].createdAt;

            if (lastLogin && fifthLastLogin) {
                const timeDiff = new Date(lastLogin) - new Date(fifthLastLogin);

                if (timeDiff < 10 * 60 * 1000) { // 10 minutes
                    score += 25;
                    reasons.push("High login frequency (bot-like)");
                }
            }
        }

        // New Account + High Activity
        const accountAgeDays =
            (Date.now() - new Date(profile?.createdAt || Date.now())) /
            (1000 * 60 * 60 * 24);

        if (accountAgeDays < 2 && activities > 10) {
            score += 25;
            reasons.push("New account with abnormal activity");
        }

        // Classification
        let level = "GENUINE";
        if (score >= 60) level = "FAKE";
        else if (score >= 30) level = "SUSPICIOUS";

        // Save or update
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