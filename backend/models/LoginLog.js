import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  ip: {
    type: String,
    required: true
  },

  userAgent: {
    type: String
  },

  device: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("LoginLog", loginLogSchema);
