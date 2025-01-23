const express = require("express");
const Authcheck = require("../middlewares/Auth.middleware");
const {
  createDriverResponse,
  getResponsesByChecklist,
  getResponsesByDriver,
  updateDriverResponse,
  getAllResponses, 

} = require("../controllers/DriverResponse.controller");
const { upload } = require("../utils/sirvUploader");

const router = express.Router();
const uploadFields = upload.fields([{ name: "uploadedImages", maxCount: 5 }]); // Allow up to 5 images

// Routes for driver responses
router.post("/response/:id", uploadFields, Authcheck, createDriverResponse); // Submit a driver response
router.get("/checklist/:id", getResponsesByChecklist); // Get all responses for a specific checklist
router.get("/driver/:driverId", getResponsesByDriver); // Get all responses by a specific driver
router.put("/response/:responseId", Authcheck, updateDriverResponse); // Update a driver response
router.get("/responses", getAllResponses); // Get all responses

module.exports = router;
