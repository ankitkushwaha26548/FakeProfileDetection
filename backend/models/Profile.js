import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    bio: {
        type: String,
        default: ''
    },

    profileImage: {
        type: String,
        default: ''
    },

    phone: {
        type: String,
        default: ''
    },

    location: {
        type: String,
        default: ''
    },

    profileCompleteness: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Profile = mongoose.model('Profile', profileSchema);
export default Profile;