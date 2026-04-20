import mongoose from "mongoose";

const riskScoreSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    score: {
        type: Number,
        default: 0
    },

    level: {
        type: String,
        enum: ['GENUINE', 'SUSPICIOUS', 'FAKE'],
        default: 'GENUINE'
    },

    reasons: [{
        type: String
    }
    ],

    accountAgeDays: {
        type: Number,
        default: 0
    },

    confidence: {
        type: Number,
        default: 0
    },

    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const RiskScore = mongoose.model("RiskScore", riskScoreSchema);
export default RiskScore;