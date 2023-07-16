const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");

router.post("/send-otp", authControllers.sendOTP);
router.post("/verify-otp", authControllers.verifyOTP);

module.exports = router;
