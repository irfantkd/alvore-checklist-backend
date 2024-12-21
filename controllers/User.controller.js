const UserModel = require("../models/User.model.js");
const session = require("express-session");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const JWT_SECRET = "w456789ol,mnhytrsxcvt#$rfvZx789&(&C5@#$RDG124gcjpoi5";
const { sendSMSUnimatrix } = require("../services/unimatrix.service.js");
const {
  verifyOTPUnimatrix,
} = require("../services/unimatrix.varify.service.js");

// Register User
const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, username, password, phone, role } = req.body;

    // Check if the username already exists
    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if the phone number already exists
    const existingPhone = await UserModel.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    const newUser = new UserModel({
      firstname,
      lastname,
      username,
      password: hashedPassword,
      phone,
      role,
    });

    // Save the user to the database
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign(
      { userid: newUser._id, username: newUser.username },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error.message);

    // Handle unique constraint errors from Mongoose
    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyValue)[0];
      return res
        .status(400)
        .json({ message: `${duplicateKey} already exists` });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await UserModel.findOne({ username }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userid: user._id, username: user.username, role: user.role },
      JWT_SECRET || "secretKey",
      { expiresIn: "30d" }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        phone: user.phone,
        profileimage: user.profileimage,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Users (Admin Only)
const getAllUsers = async (req, res) => {
  try {
    const { userid, role } = req.body;
    console.log(userid);
    console.log(role);

    // Check if the authenticated user is an admin
    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Retrieve all users
    const users = await UserModel.find({}, "-password"); // Exclude the password field
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user by ID
    const user = await UserModel.findById(id, "-password"); // Exclude the password field
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit Profile (User cannot update the role)
const editProfile = async (req, res) => {
  try {
    const { userid, firstname, lastname, phone, profileimage, role } = req.body;

    // Ensure the role is not included in the update
    if (role !== "admin") {
      return res.status(403).json({
        message: "You are not allowed to update the role field.",
      });
    }
    const objid = new mongoose.Types.ObjectId(userid);

    // Find the user and update their profile
    const updatedUser = await UserModel.findByIdAndUpdate(
      objid,
      { firstname, lastname, phone, profileimage },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        username: updatedUser.username,
        phone: updatedUser.phone,
        profileimage: updatedUser.profileimage,
        role: updatedUser.role, // Role is returned but cannot be updated
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update User Role (Admin Only)
const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    // Check if the authenticated user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Update the user's role
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Role updated successfully",
      user: {
        id: updatedUser._id,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        username: updatedUser.username,
        phone: updatedUser.phone,
        profileimage: updatedUser.profileimage,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error updating role:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    console.log(phone);

    // Validate the phone number format
    if (!phone || !/^\+?\d{10,15}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "Invalid phone number. Enter with country code" });
    }

    // Check if the user exists
    const user = await UserModel.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store the phone number in session
    req.session.phone = phone;
    console.log(req.session.phone);

    // Send the OTP
    const response = await sendSMSUnimatrix(phone);

    if (!response.success) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify OTP
// const verifyOTP = async (req, res) => {
//   const { otp, phone } = req.body;

//   if (!otp || !phone) {
//     return res
//       .status(400)
//       .json({ success: false, error: "OTP and phone number are required" });
//   }

//   const response = await verifyOTPUnimatrix(phone, otp);

//   if (response.success) {
//     console.log("OTP verified successfully:", response.data);
//     return res.status(200).json({ success: true, data: response.data });
//   } else {
//     console.error("OTP verification failed:", response.error);
//     return res.status(400).json({ success: false, error: response.error });
//   }
// };

const verifyOTP = async (req, res) => {
  try {
    const { otp, phone } = req.body;
    console.log(otp);

    // Check if OTP is provided
    if (!otp) {
      return res.status(400).json({ success: false, error: "OTP is required" });
    }

    // Retrieve phone number from session

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required!",
      });
    }

    // Verify the OTP using the phone number
    const response = await verifyOTPUnimatrix(phone, otp);

    if (response.success) {
      console.log("OTP verified successfully:", response.data);
      return res.status(200).json({ success: true, data: response.data });
    } else {
      console.error("OTP verification failed:", response.error);
      return res.status(400).json({ success: false, error: response.error });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password
// const resetPassword = async (req, res) => {
//   try {
//     const { phone, newPassword } = req.body;

//     // Find user by phone
//     const user = await UserModel.findOne({ phone });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Hash the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update user's password
//     user.password = hashedPassword;
//     await user.save();

//     res.status(200).json({ message: "Password reset successfully" });
//   } catch (error) {
//     console.error("Error resetting password:", error.message);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Retrieve phone number from session storage
    const phone = req.session.phone;

    // Check if phone exists in session
    if (!phone) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No phone number in session." });
    }

    // Find user by phone
    const user = await UserModel.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  editProfile,
  sendOTP,
  verifyOTP,
  resetPassword,
};
