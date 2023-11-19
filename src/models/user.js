const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
  },
  phone: {
    type: String,
    required: [true, "Please provide your phone number"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
