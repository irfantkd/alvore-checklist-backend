const UserModel = require("../models/User.model.js");
const Unimatrix = require("unimatrix"); // Replace this with your actual Unimatrix library
const crypto = require("crypto");

// Configure Unimatrix client
const unimatrixClient = new Unimatrix({
  apiKey: "YOUR_UNIMATRIX_API_KEY", // Replace with your Unimatrix API key
  baseURL: "YOUR_UNIMATRIX_BASE_URL", // Replace with your Unimatrix base URL
});

// Generate OTP and send to phone
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const user = await UserModel.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via Unimatrix
    await unimatrixClient.messages.send({
      to: phone,
      content: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    const user = await UserModel.findOne({ phone }).select("+otp +otpExpiry");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { sendOTP, verifyOTP };
