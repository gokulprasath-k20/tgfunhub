const User = require('../models/User');
const OTP = require('../models/OTP');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');
const generateToken = require('../utils/generateToken');

// @desc    Signup - Send OTP
// @route   POST /api/auth/signup
const signup = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email');
  }

  const userExists = await User.findOne({ email });

  if (userExists && userExists.isVerified) {
    res.status(400);
    throw new Error('User already exists and is verified');
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await OTP.findOneAndUpdate(
    { email },
    { otp, expiresAt },
    { upsert: true, new: true }
  );

  await sendEmail({
    email,
    subject: 'Verification OTP for InstaAuth',
    message: `Your verification code is: ${otp}. It expires in 5 minutes.`,
  });

  res.status(200).json({ message: 'OTP sent to email' });
};

// @desc    Verify OTP and Create User
// @route   POST /api/auth/verify
const verify = async (req, res) => {
  const { email, otp, username, password } = req.body;

  if (!email || !otp || !username || !password) {
    res.status(400);
    throw new Error('Please provide all fields');
  }

  const otpRecord = await OTP.findOne({ email, otp });

  if (!otpRecord) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  // Check if username unique
  let finalUsername = username;
  const usernameExists = await User.findOne({ username: finalUsername });

  if (usernameExists) {
    // Auto-generate username
    finalUsername = `${username}${Math.floor(Math.random() * 1000)}`;
    // In a real app, you'd loop until unique, but this is a good start
  }

  const user = await User.create({
    email,
    username: finalUsername,
    password,
    isVerified: true,
  });

  if (user) {
    await OTP.deleteOne({ email });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(res, user._id),
      message: usernameExists ? `Username taken. Created as ${finalUsername}` : 'Account verified and created',
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
      res.status(401);
      throw new Error('Please verify your email first');
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(res, user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid username or password');
  }
};

module.exports = { signup, verify, login };
