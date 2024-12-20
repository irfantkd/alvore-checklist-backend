const express = require("express");
const {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} = require("../controllers/Branch.controller");
const AuthCheck = require("../middlewares/Auth.middleware");

const router = express.Router();

// Protect the routes with AuthCheck middleware
router.post("/create", AuthCheck, createBranch);
router.get("/get_all", AuthCheck, getAllBranches);
router.get("/getby_id/:id", AuthCheck, getBranchById);
router.put("/update/:id", AuthCheck, updateBranch);
router.delete("/delete/:id", AuthCheck, deleteBranch);

module.exports = router;
