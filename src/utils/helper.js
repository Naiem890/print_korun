const otpGenerator = require("otp-generator");

// Helper function to generate a numeric OTP
function generateNumericOTP(length) {
  return otpGenerator.generate(length, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
}

// Helper function to calculate the time difference in minutes
function calculateTimeDifferenceInMinutes(createdAt) {
  const currentTime = new Date().getTime();
  const otpCreationTime = new Date(createdAt).getTime();
  return Math.floor((currentTime - otpCreationTime) / 60000); 
  // Divide by 60,000 to convert milliseconds to minutes
}

module.exports = {
  generateNumericOTP,
  calculateTimeDifferenceInMinutes,
};
