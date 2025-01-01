const mongoose = require("mongoose");
const Checklist = require("../models/Checklist.model");
const UserModel = require("../models/User.model");
const BranchModel = require("../models/Branch.model");

// Create a new checklist
const createChecklist = async (req, res) => {
  try {
    const { title, questions, userid, branches, categories } = req.body;

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

    if (branchObjects.length !== branches?.length) {
      return res
        .status(404)
        .json({ message: "One or more branches not found." });
    }

    const branchIds = branchObjects.map((branch) => branch._id);
    // const categories = category.map((category) => category);

    const checklist = new Checklist({
      title,
      questions,
      createdBy: userid,
      branches: branchIds,
      categories,
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
// Get all checklists
const getAllChecklists = async (req, res) => {
  try {
    const checklists = await Checklist.find()
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .populate("createdBy", "firstname lastname role")
      .populate("branches", "branchCode")
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
    const { branches, categories } = req.query;

    const branchFilter = branches ? { branches: { $in: branches } } : {};
    const categoryFilter = categories
      ? { categories: { $in: categories } }
      : {};

    const checklists = await Checklist.find({
      ...branchFilter,
      ...categoryFilter,
    })
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .populate("createdBy", "firstname lastname role")
      .populate("branches", "branchCode")
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
      .populate("branches", "branchCode")
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
    const { title, questions, branches, categories } = req.body;

    // Check if all branches exist
    if (branches) {
      const branchObjects = await BranchModel.find({
        branchCode: { $in: branches },
      });

      if (branchObjects.length !== branches.length) {
        return res
          .status(404)
          .json({ message: "One or more branches not found." });
      }

      const branchIds = branchObjects.map((branch) => branch._id);

      const checklist = await Checklist.findByIdAndUpdate(
        id,
        { title, questions, branches: branchIds, categories },
        { new: true, runValidators: true }
      );

      if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" });
      }

      res
        .status(200)
        .json({ message: "Checklist updated successfully", checklist });
    } else {
      const checklist = await Checklist.findByIdAndUpdate(
        id,
        { title, questions, categories },
        { new: true, runValidators: true }
      );

      if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" });
      }

      res
        .status(200)
        .json({ message: "Checklist updated successfully", checklist });
    }
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
