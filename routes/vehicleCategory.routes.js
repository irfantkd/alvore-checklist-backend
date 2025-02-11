const express = require("express");
const {
  createCategory,
  getAllCategories,
  deleteCategory,
} = require("../controllers/VehicleCategory.controller");
const AuthCheck = require("../middlewares/Auth.middleware");

const router = express.Router();

// Protected routes
router.post("/create", AuthCheck, createCategory);
router.get("/get", AuthCheck, getAllCategories);
router.delete("/delete/:id", AuthCheck, deleteCategory);

module.exports = router; 