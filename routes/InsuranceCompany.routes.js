const express = require("express");
const {
  createInsuranceCompany,
  getAllInsuranceCompanies,
  deleteInsuranceCompany
} = require("../controllers/InsuranceCompany.controller");
const AuthCheck = require("../middlewares/Auth.middleware");

const router = express.Router();

// Protected routes
router.post("/create", AuthCheck, createInsuranceCompany);
router.get("/get-all", AuthCheck, getAllInsuranceCompanies);

// Delete insurance company
router.delete("/:id", AuthCheck, deleteInsuranceCompany);

module.exports = router; 