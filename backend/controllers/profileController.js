import Profile from "../models/Profile.js";
import ProfileCompleteness from "../utils/profileCompleteness.js";
import runDetection from "../utils/fakeDetection.js";

// Create or update user profile
export const createOrUpdateProfile = async (req, res) => {
    try {
        const { bio, profileImage, phone, location } = req.body;

        let profile = await Profile.findOne({ user: req.user._id });

        if (profile) {
            //update - explicitly set values (even if empty) to allow clearing fields
            profile.bio = bio !== undefined ? bio : profile.bio;
            profile.profileImage = profileImage !== undefined ? profileImage : profile.profileImage;
            profile.phone = phone !== undefined ? phone : profile.phone;
            profile.location = location !== undefined ? location : profile.location;
        }
        else {
            //create new profile
            profile = new Profile({
                user: req.user._id,
                bio: bio || '',
                profileImage: profileImage || '',
                phone: phone || '',
                location: location || ''
            });
        }
        //calculate profile completeness
        profile.profileCompleteness = ProfileCompleteness(profile);
        console.log(`Profile updated for user ${req.user._id}, completeness: ${profile.profileCompleteness}`);

        await profile.save();
        // Trigger detection (runs in background)
        runDetection(req.user._id).catch((err) => {
            console.error("Background detection failed (profile):", err.message);
        });

        res.json({
            message: "Profile Saved",
            profile
        });

    } catch (error) {
        console.error("Profile update error:", error.message);
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


