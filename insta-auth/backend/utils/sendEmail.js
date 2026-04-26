const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use a mock setup or a real service if credentials provided
  // For this project, we'll log the OTP as well for easy testing
  console.log(`[EMAIL MOCK] To: ${options.email} | Subject: ${options.subject} | Message: ${options.message}`);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"InstaAuth" <no-reply@instaauth.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Skip actual sending if no credentials to avoid errors in demo
  if (process.env.EMAIL_USER) {
    await transporter.sendMail(mailOptions);
  }
};

module.exports = sendEmail;
