const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { validateToken } = require("../middlewares/validateToken");
const {
  generateNumericOTP,
  calculateTimeDifferenceInMinutes,
  // eslint-disable-next-line no-unused-vars
  sendSMS,
} = require("../utils/helper");
const Admin = require("../models/admin");

// In-memory storage for OTPs and their creation timestamps
const otpStorage = {};

// Function to send OTP
const sendOTP = async (userId) => {
  try {
    // Check if any OTP is already sent to this user and less than 2 minutes
    const storedOTPData = otpStorage[userId];
    if (storedOTPData) {
      const timeDifferenceInMinutes = calculateTimeDifferenceInMinutes(
        storedOTPData.createdAt
      );
      if (timeDifferenceInMinutes < 2) {
        throw new Error("Wait 2 minutes before requesting another OTP");
      }
    }

    // Fetch user from the database
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const phoneNumber = user.phone; // Fetch phone number from the user object

    const otp = generateNumericOTP(6);

    // Store the OTP and its creation timestamp
    otpStorage[userId] = {
      otp,
      createdAt: new Date(),
    };

    const message = `Your Sohoz Print App verification OTP is ${otp}`;

    // Send the OTP to the user's phone number
    await sendSMS(message, phoneNumber);
    console.log("sending...", message, phoneNumber);

    // Return the generated OTP for testing or logging purposes
    return otp;
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    throw new Error(error.message);
  }
};

router.post("/verify-otp", validateToken, async (req, res) => {
  const { _id } = req.user;
  const OTP = req.body.otp;

  if (!OTP) {
    return res.status(400).json({ error: "OTP is required" });
  }

  console.log("otpStorage", otpStorage);

  const storedOTPData = otpStorage[_id];

  if (!storedOTPData) {
    return res.status(404).json({ error: "OTP not found" });
  }

  // Compare the user-entered OTP with the stored OTP
  if (OTP !== storedOTPData.otp) {
    return res.status(401).json({ error: "Invalid OTP" });
  }

  // Calculate the time difference between OTP creation and the current time
  const timeDifferenceInMinutes = calculateTimeDifferenceInMinutes(
    storedOTPData.createdAt
  );

  // Check if OTP is older than 2 minutes
  if (timeDifferenceInMinutes > 2) {
    delete otpStorage[_id];
    return res.status(401).json({ error: "OTP expired" });
  }

  try {
    // OTP is valid and not older than 2 minutes
    delete otpStorage[_id];

    // Update the user's phone verification status
    await User.findByIdAndUpdate(_id, { isPhoneVerified: true });

    return res.status(200).json({ message: "OTP verification successful" });
  } catch (error) {
    console.error("Error updating phone verification status:", error);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

router.post("/send-otp", validateToken, async (req, res) => {
  const { _id } = req.user;

  try {
    // Call the sendOTP function
    await sendOTP(_id);

    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    // console.error("Error========>", error.message);
    return res.status(500).json({ error: error.message });
  }
});

router.post("/signup", async (req, res) => {
  let { name, phone, password, confirmedPassword } = req.body;

  if (!name || !phone || !password || !confirmedPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // match phoneNumber with regex to check if it is a valid phone number
  const phoneNumberRegex = /^(\+88)?(01[3-9]\d{8})$/;
  if (!phoneNumberRegex.test(phone)) {
    return res.status(400).json({ error: "Invalid phone number" });
  }
  //only the last 11 digits of the phone number
  phone = phone.slice(-11);

  if (password !== confirmedPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  const existingUser = await User.findOne({ phone });

  if (existingUser) {
    return res
      .status(400)
      .json({ error: "User already exists with this phone number" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    phone,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();

    // Call the sendOTP function after the user is successfully registered
    await sendOTP(savedUser._id);

    const token = jwt.sign(
      { role: "user", _id: user._id },
      // eslint-disable-next-line no-undef
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: savedUser,
      token,
    });
  } catch (error) {
    console.log("Error registering user:", error);
    res.status(500).json({ error: "Could not register user" });
  }
});

router.get("/check-token-validity", validateToken, async (req, res) => {
  res.status(200).json({ isValid: true, message: "Token is valid" });
});

router.post("/login", async (req, res) => {
  let { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  phone = phone.slice(-11);

  const user = await User.findOne({ phone });

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  delete user.password;

  const token = jwt.sign(
    { role: "user", _id: user._id },
    // eslint-disable-next-line no-undef
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );

  res.json({ token, user });
});

// Admin login
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const admin = await Admin.findOne({
      email: { $regex: new RegExp(email, "i") },
    });

    console.log("admin", admin);
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res
        .status(401)
        .json({ message: "Invalid admin email or password" });
    }

    // eslint-disable-next-line no-undef
    console.log("JWT_SECRET", process.env.JWT_SECRET);
    // Create a JWT token
    const token = jwt.sign(
      { email: admin.email, _id: admin._id, role: "admin" },
      // eslint-disable-next-line no-undef
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({ token, admin, role: "admin" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
