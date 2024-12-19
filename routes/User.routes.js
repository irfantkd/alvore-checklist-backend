const express = require("express");
const router = express.Router();

// Import your controller functions
const {
  registerUser,
  loginUser,
  forgotPassword,
  editProfile,
} = require("../controllers/User.controller.js");

// Define routes
router.post("/register", registerUser); // Ensure 'createUser' is a valid function
router.post("/login", loginUser); // Ensure 'createUser' is a valid function
router.post("/forget-password", forgotPassword);
router.post("/edit-profile", editProfile);

module.exports = router;
