"use strict";

const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const fs = require("fs");
const {
  getSirvToken,
  upload,
  uploadToSirv,
  uploadMultiToSrv,
} = require("./utils/sirvUploader");
const axios = require("axios");

// const streamifier = require("streamifier");
const FormData = require("form-data");

// Handle Multiple Fields
// const uploadFields = upload.fields([
//   { name: "profilePicture", maxCount: 1 },
//   { name: "coverPhoto", maxCount: 1 },
// ]);

// app.post("/uploadmulti", uploadFields, async (req, res) => {
//   try {
//     for (const key in req.files) {
//       const singleFile = req.files[key][0];
//       const filePath = singleFile.path;

//       // Create FormData and append the buffer stream as the file
//       const formData = new FormData();
//       formData.append("file", filePath, {
//         filename: singleFile.filename,
//         contentType: singleFile.mimetype,
//       });

//       console.log(formData);

//       const url = await uploadMultiToSrv(formData);
//       console.log(url);
//     }

//     res.json({ message: "File uploaded successfully", file: req.file });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// });
const uploadFields = upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "coverPhoto", maxCount: 1 },
  { name: "uploadedImages", maxCount: 10 },  // Update this field name to match the model
  // Add 'images' field for multiple image uploads
]);


app.post("/uploadmulti", uploadFields, async (req, res) => {
  try {
    const uploadedFiles = [];
    for (const key in req.files) {
      const singleFile = req.files[key][0]; // Get the file from the array
      const filePath = singleFile.path;    // Path to the uploaded file

      // Read the file from disk as a Buffer
      const fileBuffer = fs.readFileSync(filePath);
      const originalName = path.basename(filePath); // Get the filename

      // Call upload function to Sirv (or your storage service)
      const url = await uploadMultiToSrv(fileBuffer, originalName);
      uploadedFiles.push({ field: key, url });
    }

    res.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// Import routes
const UserRoutes = require("./routes/User.routes");
const CarRoutes = require("./routes/Car.routes");
const BranchRoutes = require("./routes/Branch.routes");
const RouteRoutes = require("./routes/Route.routes");
const DriverResponseRoutes = require("./routes/DriverResponse.routes");
const ChecklistRoutes = require("./routes/Checklist.routes");
const VehicleCategoryRoutes = require("./routes/vehicleCategory.routes");
const InsuranceCompanyRoutes = require("./routes/InsuranceCompany.routes");
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

// Define a test route
// app.get("/", (req, res) => {
//   res.send("Welcome to the API");
// });

// Routes
app.use("/auth", UserRoutes);
app.use("/car", CarRoutes);
app.use("/branch", BranchRoutes);
app.use("/route", RouteRoutes);
app.use("/driver", DriverResponseRoutes);
app.use("/checklist", ChecklistRoutes);
app.use("/vehicle-category", VehicleCategoryRoutes);
app.use("/insurance-companies", InsuranceCompanyRoutes);
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
