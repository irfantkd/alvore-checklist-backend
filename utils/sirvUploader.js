"use strict";

const axios = require("axios");
const multer = require("multer");
require("dotenv").config();
const path = require("path");

// Sirv API credentials from environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SIRV_BUCKET_NAME = process.env.SIRV_BUCKET_NAME;

// Function to fetch Sirv API token using Axios
const getSirvToken = async () => {
  try {
    const response = await axios.post("https://api.sirv.com/v2/token", {
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });

    if (response.data && response.data.token) {
      console.log("Token retrieved successfully.");
      return response.data.token;
    } else {
      throw new Error(
        `Token retrieval failed: ${response.data.message || "Unknown error"}`
      );
    }
  } catch (error) {
    console.error(
      "Error fetching Sirv token:",
      error.response?.data.message || error.message
    );
    throw error;
  }
};

const uploadToSirv = async (originalName) => {
  try {
    const token = await getSirvToken(); // Retrieve the token
    console.log("Original name:", originalName);

    // Ensure the fileBuffer is a valid buffer
    if (!Buffer.isBuffer(fileBuffer)) {
      throw new Error("Provided file is not a valid buffer.");
    }

    console.log("File data received successfully. Size:", fileBuffer.length);

    // Make the POST request to upload the binary data to Sirv
    const response = await axios.post(
      `https://api.sirv.com/v2/files/upload?filename=${originalName}`,
      fileBuffer, // Send the raw binary data here
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream", // Binary encoding for raw file data
        },
      }
    );

    console.log("Upload response:", response.data);

    if (response.status === 200) {
      console.log("File uploaded successfully.");

      return `https://${SIRV_BUCKET_NAME}.sirv.com/${originalName}`;
    } else {
      throw new Error(`Upload failed: ${response.data}`);
    }
  } catch (error) {
    console.error(
      "Error uploading to Sirv:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const uploadMultiToSrv = async (fileBuffer, originalName) => {
  try {
    const token = await getSirvToken(); // Retrieve the Sirv API token

    // Ensure the fileBuffer is a valid buffer
    if (!Buffer.isBuffer(fileBuffer)) {
      throw new Error("Provided file is not a valid buffer.");
    }

    // Upload the file to Sirv
    const response = await axios.post(
      `https://api.sirv.com/v2/files/upload?filename=/${originalName}`,
      fileBuffer, // Send the binary data as the body
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream", // Raw binary data
        },
      }
    );

    if (response.status === 200) {
      return `https://${SIRV_BUCKET_NAME}.sirv.com/${originalName}`;
    } else {
      throw new Error(`Upload failed: ${response.data}`);
    }
  } catch (error) {
    console.error(
      "Error uploading to Sirv:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// const upload = multer({
//   storage: multer.memoryStorage(), // Store files in memory as buffers
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true); // Accept only image files
//     } else {
//       cb(new Error("Only image files are allowed!"), false); // Reject non-image files
//     }
//   },
// });
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/"); // Folder to save the images
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
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"));
    }
  },
});

// Export functions for reuse
module.exports = { uploadMultiToSrv, upload, getSirvToken };
