import Activity from "../models/Activity.js";

// Log user activity
export const logActivity = async (userId, type, targetId=null, metadata = {}) => {
    try {
        await Activity.create({
            user: userId,
            type,
            targetId,
            metadata
        });
    } catch (error) {
        console.error("Activity log error:", error.message);
    }
};