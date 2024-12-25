const { default: mongoose } = require("mongoose");
const BranchModel = require("../models/Branch.model");
const UserModel = require("../models/User.model");

// Create a new branch
const createBranch = async (req, res) => {
  try {
    const { userid } = req.body;
    const userobjid = new mongoose.Types.ObjectId(userid);
    const user = await UserModel.findById(userobjid);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can create branch." });
    }
    if (req.body.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a branch",
      });
    }

    const newBranch = await BranchModel.create(req.body);
    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: newBranch,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create branch",
      error: error.message,
    });
  }
};

// Get all branches
const getAllBranches = async (req, res) => {
  try {
    const branches = await BranchModel.find();
    res.status(200).json({
      success: true,
      data: branches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve branches",
      error: error.message,
    });
  }
};

// Get a single branch by ID
const getBranchById = async (req, res) => {
  try {
    const branch = await BranchModel.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }
    res.status(200).json({
      success: true,
      data: branch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve branch",
      error: error.message,
    });
  }
};

// Update a branch by ID
const updateBranch = async (req, res) => {
  try {
    if (req.body.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update a branch",
      });
    }

    const updatedBranch = await BranchModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedBranch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: updatedBranch,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update branch",
      error: error.message,
    });
  }
};

// Delete a branch by ID
const deleteBranch = async (req, res) => {
  try {
    if (req.body.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete a branch",
      });
    }

    const deletedBranch = await BranchModel.findByIdAndDelete(req.params.id);
    if (!deletedBranch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete branch",
      error: error.message,
    });
  }
};

// Export all methods
module.exports = {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
};
