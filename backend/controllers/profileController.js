import Profile from "../models/Profile.js";
import { calculateProfileScore } from "../utils/profileScore.js";
import runDetection from "../utils/fakeDetection.js";

// Create or update user profile
export const createOrUpdateProfile = async (req, res) => {
    try {
        const { bio, profileImage, phone, location } = req.body;

        let profile = await Profile.findOne({ user: req.user._id });

        if (profile) {
            //update 
            profile.bio = bio || profile.bio;
            profile.profileImage = profileImage || profile.profileImage;
            profile.phone = phone || profile.phone;
            profile.location = location || profile.location;

        }
        else {
            //create new profile
            profile = new Profile({
                user: req.user._id,
                bio,
                profileImage,
                phone,
                location
            });
        }
        //calculate profile completeness
        profile.profileCompleteness = calculateProfileScore(profile);

        await profile.save();
        runDetection(req.user._id).catch((err) => {
            console.error("Background detection failed (profile):", err.message);
        });

        res.json({
            message: "Profile Saved",
            profile
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Get my profile
export const getMyProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user._id }).populate('user', 'name email');
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


