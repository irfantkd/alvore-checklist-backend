const express = require("express");
const {
  createChecklist,
  getAllChecklists,
  getChecklistById,
  updateChecklist,
  deleteChecklist,
  getChecklistForDriver,
} = require("../controllers/Checklist.controller");
const AuthCheck = require("../middlewares/Auth.middleware");

const router = express.Router();

// Routes for checklist
router.post("/create", AuthCheck, createChecklist); // Create a new checklist
router.get("/get-all", getAllChecklists); // Get all checklists
router.get("/getby-id/:id", getChecklistById); // Get a checklist by ID
router.get("/getChecklistForDriver/:id", AuthCheck, getChecklistForDriver);
router.put("/update/:id", AuthCheck, updateChecklist); // Update a checklist
router.delete("/delete/:id", AuthCheck, deleteChecklist); // Delete a checklist

module.exports = router;
