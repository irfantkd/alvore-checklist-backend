const mongoose = require("mongoose");
const Checklist = require("../models/Checklist.model");
const UserModel = require("../models/User.model");
const BranchModel = require("../models/Branch.model"); // Ensure Branch model is imported

// Create a new checklist
const createChecklist = async (req, res) => {
  try {
    const { title, questions, userid, branches, categories } = req.body;

    if (!Array.isArray(branches) || branches.length === 0) {
      return res
        .status(400)
        .json({ message: "Branches must be a non-empty array." });
    }
    if (!Array.isArray(categories) || categories.length === 0) {
      return res
        .status(400)
        .json({ message: "Categories must be a non-empty array." });
    }

    const userobjid = new mongoose.Types.ObjectId(userid);

    // Verify the user is an admin
    const user = await UserModel.findById(userobjid);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can create checklists." });
    }

    // Verify all branches exist
    const branchObjects = await BranchModel.find({
      branchCode: { $in: branches },
    });

    if (branchObjects.length !== branches.length) {
      return res
        .status(404)
        .json({ message: "One or more branches not found." });
    }

    // Create the checklist
    const checklist = new Checklist({
      title,
      questions,
      createdBy: userid,
      branches: branchObjects.map((b) => b._id), // Save branch IDs as references
      categories, // Save categories as an array
    });

    await checklist.save();

    res
      .status(201)
      .json({ message: "Checklist created successfully", checklist });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating checklist", error: error.message });
  }
};

// Get all checklists
const getAllChecklists = async (req, res) => {
  try {
    const checklists = await Checklist.find()
      .populate("createdBy", "firstname lastname role")
      .populate("branches", "branchCode") // Populate multiple branches
      .exec();

    res.status(200).json(checklists);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching checklists", error: error.message });
  }
};

// Get checklists by branch and category
const getChecklistsByBranchAndCategory = async (req, res) => {
  try {
    const { branch, category } = req.query;

    const checklists = await Checklist.find({ branch, category })
      .populate("createdBy", "firstname lastname role")
      .populate("branch", "name")
      .exec();

    res.status(200).json(checklists);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching checklists", error: error.message });
  }
};

// Get a checklist by ID
const getChecklistById = async (req, res) => {
  try {
    const { id } = req.params;

    const checklist = await Checklist.findById(id)
      .populate("createdBy", "firstname lastname role")
      .populate("branch", "name")
      .exec();

    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found" });
    }

    res.status(200).json(checklist);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching checklist", error: error.message });
  }
};

// Update a checklist
const updateChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, questions, branch, category } = req.body;

    // Check if branch exists
    if (branch) {
      const branchExists = await BranchModel.findById(branch);
      if (!branchExists) {
        return res.status(404).json({ message: "Branch not found." });
      }
    }

    const checklist = await Checklist.findByIdAndUpdate(
      id,
      { title, questions, branch, category },
      { new: true, runValidators: true }
    );

    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found" });
    }

    res
      .status(200)
      .json({ message: "Checklist updated successfully", checklist });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating checklist", error: error.message });
  }
};

// Delete a checklist
const deleteChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const checklist = await Checklist.findByIdAndDelete(id);

    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found" });
    }

    res.status(200).json({ message: "Checklist deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting checklist", error: error.message });
  }
};

module.exports = {
  createChecklist,
  getAllChecklists,
  getChecklistsByBranchAndCategory,
  getChecklistById,
  updateChecklist,
  deleteChecklist,
};
