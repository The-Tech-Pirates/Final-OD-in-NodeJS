const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Set up the Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
    secure: false,
  auth: {
    user: 'kanavchauhan001@gmail.com',
    pass: 'nckcubawcueyfrik',
  },
});

// Helper function to generate and send the verification code
function sendVerificationCode(email) {
  const verificationCode = crypto.randomInt(100000, 999999);
  const mailOptions = {
    from: '"SRM OD" <kanavchauhan001@gmail.com>',
    to: email,
    subject: 'Verification Code',
    text: `Your verification code is ${verificationCode}`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent to ${email}: ${info.response}`);
    }
  });
  return verificationCode;
}

module.exports = {
  sendVerificationCode,
};
