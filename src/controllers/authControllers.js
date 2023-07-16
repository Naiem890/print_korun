const axios = require("axios");
const {
  generateNumericOTP,
  calculateTimeDifferenceInMinutes,
} = require("../utils/helper");

// In-memory storage for OTPs and their creation timestamps
const otpStorage = {};

const sendOTP = async (req, res) => {
  const phoneNumber = req.body.phoneNumber;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  const otp = generateNumericOTP(6);

  // Store the OTP and its creation timestamp
  otpStorage[phoneNumber] = {
    otp,
    createdAt: new Date(),
  };

  await axios
    .post(`http://bulksmsbd.net/api/smsapi`, {
      api_key: process.env.API_KEY,
      type: "text",
      number: phoneNumber,
      senderid: process.env.SENDERID,
      message: `Your Print Korun App varification OTP is ${otp}`,
    })
    .then((response) => {
      console.log(response.data);
      res.json({ message: "OTP sent successfully" });
    })
    .catch((error) => {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    });
  console.log("otpStorage", otpStorage);
};

const verifyOTP = async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const userEnteredOTP = req.body.otp;

  if (!phoneNumber || !userEnteredOTP) {
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }
  console.log("otpStorage", otpStorage);

  const storedOTPData = otpStorage[phoneNumber];

  if (!storedOTPData) {
    return res.status(404).json({ error: "OTP not found" });
  }

  // Compare the user-entered OTP with the stored OTP
  if (userEnteredOTP !== storedOTPData.otp) {
    return res.status(401).json({ error: "Invalid OTP" });
  }

  // Calculate the time difference between OTP creation and the current time
  const timeDifferenceInMinutes = calculateTimeDifferenceInMinutes(
    storedOTPData.createdAt
  );

  // Check if OTP is older than 2 minutes
  if (timeDifferenceInMinutes > 2) {
    delete otpStorage[phoneNumber];
    return res.status(401).json({ error: "OTP expired" });
  }

  // OTP is valid and not older than 2 minutes

  delete otpStorage[phoneNumber];

  res.json({ message: "OTP verification successful" });
};

module.exports = {
  sendOTP,
  verifyOTP,
};
