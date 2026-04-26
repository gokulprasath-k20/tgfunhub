const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set JWT as an HTTP-Only cookie or just return it. 
  // For simplicity in this demo, we'll return it in the response.
  return token;
};

module.exports = generateToken;
