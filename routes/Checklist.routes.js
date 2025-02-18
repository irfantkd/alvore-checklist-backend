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
const { upload } = require("../utils/sirvUploader");

const router = express.Router();
const uploadFields = upload.fields([{ name: "uploadedImages", maxCount: 10 }]); // Allow up to 10 images

// Routes for checklist
router.post("/create", uploadFields, AuthCheck, createChecklist); // Create a new checklist
router.get("/get-all", getAllChecklists); // Get all checklists
router.get("/getby-id/:id", getChecklistById); // Get a checklist by ID
// router.get("/getChecklistForDriver/:id", AuthCheck, getChecklistForDriver);
router.put("/update/:id", uploadFields, AuthCheck, updateChecklist); // Update a checklist
router.delete("/delete/:id", AuthCheck, deleteChecklist); // Delete a checklist

module.exports = router;
