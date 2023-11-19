const otpGenerator = require("otp-generator");
const axios = require("axios");

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

const sendSMS = async (message, phone) => {
  // eslint-disable-next-line no-undef
  const apiKey = process.env.API_KEY;
  // eslint-disable-next-line no-undef
  const senderId = process.env.SENDER_ID;

  console.log("apiKey", apiKey);
  console.log("senderId", senderId);
  console.log("message", message);
  console.log("phone", phone);
  if (!apiKey || !senderId) {
    throw new Error("API_KEY or SENDER_ID is missing");
  } else if (!message || !phone) {
    throw new Error("Phone number or message is missing");
  }

  return await axios.post(`http://bulksmsbd.net/api/smsapi`, {
    api_key: apiKey,
    type: "text",
    number: phone,
    senderid: senderId,
    message: message,
  });
};

module.exports = {
  generateNumericOTP,
  calculateTimeDifferenceInMinutes,
  sendSMS,
};
