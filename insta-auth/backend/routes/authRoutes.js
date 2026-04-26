const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { signup, verify, login } = require('../controllers/authController');

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 signup requests per windowMs
  message: 'Too many signup attempts from this IP, please try again after 15 minutes',
});

router.post('/signup', signupLimiter, signup);
router.post('/verify', verify);
router.post('/login', login);

module.exports = router;
