const express = require("express");
const Authcheck = require("../middlewares/Auth.middleware");
const {
  createDriverResponse,
  getResponsesByChecklist,
  getResponsesByDriver,
  updateDriverResponse,
} = require("../controllers/DriverResponse.controller");

const router = express.Router();

// Routes for driver responses
router.post("/response/:id", Authcheck, createDriverResponse); // Submit a driver response
router.get("/checklist/:id", getResponsesByChecklist); // Get all responses for a specific checklist
router.get("/driver/:driverId", getResponsesByDriver); // Get all responses by a specific driver
router.put("/response/:responseId", Authcheck, updateDriverResponse); // Update a driver response

module.exports = router;
