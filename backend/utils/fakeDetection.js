import Profile from '../models/Profile.js';
import Activity from '../models/Activity.js';
import RiskScore from '../models/RiskScore.js';
import LoginLog from '../models/LoginLog.js';

export const runDetection = async (userId) => {
    let score = 0;
    let reasons = [];

    //profile completeness
    const profile = await Profile.findOne({ user: userId });
if (!profile || profile.completeness < 40) {
        score += 20;
        reasons.push("Low profile completeness");
    }

    //activity pattern
    const activities = await Activity.countDocuments({ user: userId });
if (activities < 3) {
    score +=15;
    reasons.push("Very low activity");
}

//Login Frequency
const logins = await Activity.find({ user: userId, type: 'LOGIN' })
.sort({ timestamp: -1 })
.limit(10);

if (logins.length > 5) {
    const timeDiff = new Date(logins[0].createdAt) - new Date(logins[4].createdAt);
    if (timeDiff < 10 * 60 * 1000) { // 10 minutes
score += 25;
reasons.push("High login frequency (bot-like)");
}
}

//New Account + High Activity
const accountAgeDays = (Date.now() - new Date(profile?.createdAt || Date.now())) / (1000 * 60 * 60 * 24);
if (accountAgeDays < 2 && activities > 10) {
score += 25;
reasons.push("New account with abnormal activity");
}

//IP change Pattern(future logic hook)
//Can be added when LoginLog is active

//Classification
let level = "GENUINE";
if (score >= 60) level = "FAKE";
else if (score >= 30) level = "SUSPICIOUS";

//Save or update
let risk = await RiskScore.findOne({ user: userId });

if (!risk) {
    risk = await RiskScore.create({
        user: userId,
        score,
        level,
        reasons
});
}else {
risk.score = score;
risk.level = level;
risk.reasons = reasons;
risk.lastUpdated = new Date();
await risk.save();
}

return risk;

};
