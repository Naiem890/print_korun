// otpUtils.js

const otpGenerator = require("otp-generator");

function generateNumericOTP(length) {
  return otpGenerator.generate(length, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
}

module.exports = {
  generateNumericOTP,
};
