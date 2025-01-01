const express = require("express");
const AuthCheck = require("../middlewares/Auth.middleware");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  editProfile,
  sendOTP,
  verifyOTP,
  resetPassword,
} = require("../controllers/User.controller");
const { upload } = require("../utils/sirvUploader");
const uploadFields = upload.fields([
  { name: "profileimage", maxCount: 1 },
  { name: "licenseimage", maxCount: 1 },
]);
const router = express.Router();

// Public routes
router.post("/register", AuthCheck, uploadFields, registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/users", AuthCheck, getAllUsers); // Admin only
router.get("/users/:id", AuthCheck, getUserById); // Admin or user
router.put("/users/role", AuthCheck, updateUserRole); // Admin only
router.put("/user/update", uploadFields, AuthCheck, editProfile); // Admin only

// otp routes
router.post("/forgot-password/send-otp", sendOTP);
router.post("/forgot-password/verify-otp", verifyOTP);
router.post("/forgot-password/reset", resetPassword);

module.exports = router;
