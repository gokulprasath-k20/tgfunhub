const mongoose = require('mongoose');

const otpSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // Automatically delete after expiresAt
  },
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
