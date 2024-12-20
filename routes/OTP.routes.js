const express = require("express");
const { sendOTP, verifyOTP } = require("../controllers/User.controller");

const router = express.Router();

router.post("/otp/send", sendOTP);
router.post("/otp/verify", verifyOTP);

module.exports = router;
