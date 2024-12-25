const express = require("express");
const Authcheck = require("../middlewares/Auth.middleware");
const {
  createDriverResponse,
  getResponsesByChecklist,
  getResponsesByDriver,
} = require("../controllers/DriverResponse.controller");

const router = express.Router();

// Routes for driver responses
router.post("/responce/:id", Authcheck, createDriverResponse); // Submit a driver response
router.get("/checklist/:id", getResponsesByChecklist); // Get all responses for a specific checklist
// router.get("/driver/:driverId", getResponsesByDriver); // Get all responses by a specific driver

module.exports = router;
