import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    type: {
        type: String,
        enum: ['LOGIN', 'POST', 'LIKE_POST', 'COMMENT', 'FOLLOW'],
        required: true
    },

    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },

    metadata: {
        type: Object
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;