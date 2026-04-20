import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
 
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    //add blocking functionality 
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockedAt: {
        type: Date,
        default: null
    }, 
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    blockReason: {
        type: String,
        default: null
    }
}, { 
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
