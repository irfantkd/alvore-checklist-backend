"use strict";

const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const crypto = require("crypto");
const fs = require("fs");
const { getSirvToken } = require("./utils/sirvUploader");
const axios = require("axios");


const multer = require('multer');
const path = require('path');
const streamifier = require('streamifier');
const FormData = require('form-data');


// Multer Instance
// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // Folder to save the images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Check file type
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'));
    }
  },
});

// Handle Multiple Fields
const uploadFields = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'coverPhoto', maxCount: 1 }
])

app.post("/uploadmulti", uploadFields, async (req, res) => {
  try {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IlhVTkJCT3RoVDBEZGJ6NEdXUWY1eG9wZGNhdCIsImNsaWVudE5hbWUiOiJBbHZvcmUiLCJzY29wZSI6WyJhY2NvdW50OnJlYWQiLCJhY2NvdW50OndyaXRlIiwidXNlcjpyZWFkIiwidXNlcjp3cml0ZSIsImJpbGxpbmc6cmVhZCIsImJpbGxpbmc6d3JpdGUiLCJmaWxlczpyZWFkIiwiZmlsZXM6d3JpdGUiLCJmaWxlczpjcmVhdGUiLCJmaWxlczp1cGxvYWQ6bXVsdGlwYXJ0IiwiZmlsZXM6c2hhcmVkQmlsbGluZyIsInZpZGVvcyIsImltYWdlcyJdLCJpYXQiOjE3MzUyMDE5NjcsImV4cCI6MTczNTIwMzE2NywiYXVkIjoiZ2JybnEyaGFkNXJqcnJ3cmF4YmZqODdqdWhxd2pqc3gifQ.8FuTQMlkdgP3L3EgFWJu2RRrt0SoRQV3r1x_CEVyRNI"; //await getSirvToken();
    // console.log("token", token);
    // return;
    //  console.log(req.files); // Logs the uploaded file information

    // if (!req.files || req.files.length === 0) {
    //   return res.status(400).json({ message: "No files uploaded" });
    // }
    // Access uploaded files
    // console.log("Profile Picture:", req.files.profilePicture);
    // console.log("Cover Photo:", req.files.coverPhoto);

    const responses = [];
    // const uploadedFiles = [req.files.profilePicture, req.files.coverPhoto];
    // console.log(uploadedFiles);

    // Loop through uploaded files
    for (const key in req.files) {
      const singleFile = req.files[key][0];
      const filePath = singleFile.path;

      // Convert the file to a stream using streamifier
      const fileStream = fs.createReadStream(filePath);
      const bufferStream = streamifier.createReadStream(fileStream);

      // Create FormData and append the buffer stream as the file
      const formData = new FormData();
      formData.append('file', bufferStream, { filename: singleFile.filename, contentType: singleFile.mimetype });

      // Send the file to Sirv
      const response = await axios.post(
        'https://api.sirv.com/v2/files/upload',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
          params: {
            filename: `/uploads/${singleFile.filename}`, // Sirv file path
          },
        }
      );

      responses.push(response.data);
    }

    console.log(responses);


    res.json({ message: "File uploaded successfully", file: req.file });
  } catch (error) {
    console.error(error);
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
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

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
