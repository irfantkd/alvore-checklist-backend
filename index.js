"use strict";

const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const crypto = require("crypto");
const fs = require("fs");
const {
  getSirvToken,
  upload,
  uploadToSirv,
  uploadMultiToSrv,
} = require("./utils/sirvUploader");
const axios = require("axios");

const multer = require("multer");
const path = require("path");
// const streamifier = require("streamifier");
const FormData = require("form-data");

// Handle Multiple Fields
const uploadFields = upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "coverPhoto", maxCount: 1 },
]);

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
// app.post("/uploadmulti", uploadFields, async (req, res) => {
//   try {
//     const uploadedFiles = [];
//     for (const key in req.files) {
//       const singleFile = req.files[key][0];
//       const filePath = singleFile.path; // Path to the uploaded file

//       // Read the file from disk as a Buffer
//       const fileBuffer = fs.readFileSync(filePath);
//       const originalName = path.basename(filePath); // Extract the filename

//       // Call upload function to Sirv
//       const url = await uploadMultiToSrv(fileBuffer, originalName);
//       uploadedFiles.push({ field: key, url });
//       console.log(url);
//     }

//     res.json({
//       message: "Files uploaded successfully",
//       files: uploadedFiles,
//     });
//   } catch (error) {
//     console.error("Upload Error:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// Import routes
const UserRoutes = require("./routes/User.routes");
const CarRoutes = require("./routes/Car.routes");
const BranchRoutes = require("./routes/Branch.routes");
const RouteRoutes = require("./routes/Route.routes");
const DriverResponseRoutes = require("./routes/DriverResponse.routes");
const ChecklistRoutes = require("./routes/Checklist.routes");

// Middlewares
app.use(express.json()); // For parsing JSON requests
app.use(cors()); // For handling Cross-Origin requests

const secret = crypto.randomBytes(32).toString("hex");
app.use(
  session({
    secret: secret || "your-secret-key",
    resave: false, // Prevent resaving sessions if unchanged
    saveUninitialized: false, // Don't save empty sessions
    cookie: {
      httpOnly: true,
      secure: false, // Change to true if using HTTPS
      maxAge: 30 * 60 * 1000, // Session expiration: 30 minutes
    },
  })
);

// Define a test route
// app.get("/", (req, res) => {
//   res.send("Welcome to the API");
// });

// Use routes
app.use("/auth", UserRoutes);
app.use("/car", CarRoutes);
app.use("/branch", BranchRoutes);
app.use("/route", RouteRoutes);
app.use("/driver", DriverResponseRoutes);
app.use("/checklist", ChecklistRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Export the app for deployment (e.g., Vercel)
module.exports = app;
