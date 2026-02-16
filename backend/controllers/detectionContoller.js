import { rundetection } from "../utils/fakeDetection";
import RiskScore from "../models/RiskScore";

//Run detection manually
export const runDetectionForUser = async (req, res) => {
    try {
        const result = await rundetection(req.params.userId);
        res.json ({
            message: "Detection completed",
            result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Get my risk score 
export const getMyRisk = async (req, res) => {
    try {
        const risk = await RiskScore.findOne({ user: req.user._id });
        res.json(risk || {score: 0, level: "GENUIINE" });
} catch (error) {
res.status(500).json({ error: error.message });
    }
};

//Admin: get all risky users
export const getAllRiskyUsers = async (req, res) => {
    try{
        const risks = await RiskScore.find().populate("user", "name email");
        res.json(risks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
