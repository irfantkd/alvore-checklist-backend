"use strict";

const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Import routes
const UserRoutes = require("./routes/User.routes");
const CarRoutes = require("./routes/Car.routes");
const BranchRoutes = require("./routes/Branch.routes");
const RouteRoutes = require("./routes/Route.routes");
const DriverResponseRoutes = require("./routes/DriverResponse.routes");
const ChecklistRoutes = require("./routes/Checklist.routes");

// Create upload directory if it doesn't exist

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // Save files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const multipleUpload = upload.fields([
  { name: "profileimage", maxCount: 1 }, // Single image field
  { name: "galleryimages", maxCount: 8 }, // Array of images field
]);

// Middlewares
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Handle CORS

// Configure session
const secret = crypto.randomBytes(32).toString("hex");
app.use(
  session({
    secret: secret || "your-secret-key",
    resave: false, // Prevent resaving unchanged sessions
    saveUninitialized: false, // Don't save empty sessions
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      maxAge: 30 * 60 * 1000, // 30 minutes
    },
  })
);

// Test Route
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// Routes
app.use("/auth", UserRoutes);
app.use("/car", CarRoutes);
app.use("/branch", BranchRoutes);
app.use("/route", RouteRoutes);
app.use("/driver", DriverResponseRoutes);
app.use("/checklist", ChecklistRoutes);

// Upload Route
app.post(
  "/upload",
  (req, res, next) => {
    multipleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Handle Multer errors
        return res.status(400).json({ error: `Multer error: ${err.message}` });
      } else if (err) {
        // Handle general errors
        return res.status(500).json({ error: `Server error: ${err.message}` });
      }
      next();
    });
  },
  (req, res) => {
    try {
      const profileImage = req.files?.profileimage?.[0]; // Extract profile image
      const galleryImages = req.files?.galleryimages || []; // Extract gallery images

      res.status(200).json({
        message: "Images uploaded successfully",
        profileImage: profileImage?.filename,
        galleryImages: galleryImages.map((img) => img.filename),
      });
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/yourDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Start the Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Export the app for deployment (e.g., Vercel)
module.exports = app;
