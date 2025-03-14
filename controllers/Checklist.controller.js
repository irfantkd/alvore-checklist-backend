const mongoose = require("mongoose");
const Checklist = require("../models/Checklist.model");
const UserModel = require("../models/User.model");
const BranchModel = require("../models/Branch.model");
const fs = require("fs");
const path = require("path");
const { uploadMultiToSrv } = require("../utils/sirvUploader");
const VehicleCategoryModel = require("../models/VehicleCategory.model");

// Create check list
const createChecklist = async (req, res) => {
  try {
    const { title, categories, branches, questions, userid } = req.body;

    // Validate categories array
    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: "Categories must be provided as an array"
      });
    }

    // Verify categories exist and are valid ObjectIds
    const validCategories = categories.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validCategories.length !== categories.length) {
      return res.status(400).json({
        success: false,
        message: "One or more category IDs are invalid",
        invalidCategories: categories.filter(id => !mongoose.Types.ObjectId.isValid(id))
      });
    }

    // Find all valid categories
    const categoryObjects = await VehicleCategoryModel.find({
      _id: { $in: validCategories }
    });

    if (categoryObjects.length !== categories.length) {
      const foundIds = categoryObjects.map(cat => cat._id.toString());
      const missingCategories = categories.filter(id => !foundIds.includes(id));
      return res.status(404).json({ 
        success: false,
        message: "One or more categories not found",
        missingCategories
      });
    }

    // Verify the user is an admin
    // const user = await UserModel.findById(userid);
    // if (!user || user.role !== "admin") {
    //   return res
    //     .status(403)
    //     .json({ message: "Only admins can create checklists." });
    // }

    // Verify all branches exist
    console.log("branches", branches);

    const branchObjects = await BranchModel.find({
      branchCode: { $in: branches },
    });
    console.log("branchObjects", branchObjects);

    if (branchObjects.length !== branches?.length) {
      return res
        .status(404)
        .json({ message: "One or more branches not found." });
    }

    // Handle uploaded images for questions
    const uploadedImages = [];
    if (req.files) {
      for (const [index, question] of questions.entries()) {
        const files = req.files.uploadedImages; // Expecting files under 'uploadedImages'
        if (files) {
          const fileUrls = [];
          for (const file of files) {
            const filePath = file.path; // Path to the uploaded file
            const fileBuffer = fs.readFileSync(filePath); // Read the file as a buffer
            const originalName = path.basename(filePath); // Get the filename

            // Call your upload function to upload the image
            const url = await uploadMultiToSrv(fileBuffer, originalName);
            fileUrls.push(url);
          }
          uploadedImages.push({ questionId: index, imageUrls: fileUrls });
        }
      }
    }

    // Create the checklist
    const checklist = new Checklist({
      title,
      categories: validCategories,
      branches: branchObjects.map((branch) => branch._id),
      questions,
      uploadedImages, // Attach uploaded images
      createdBy: userid,
    });

    await checklist.save();
    res.status(201).json({
      success: true,
      message: "Checklist created successfully",
      checklist,
    });
  } catch (error) {
    console.error("Error creating checklist:", error);
    res.status(500).json({
      success: false,
      message: "Error creating checklist",
      error: error.message,
    });
  }
};

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

    // Handle image uploads
    const uploadedFiles = {};
    if (req.files) {
      for (const questionKey in req.body.questions) {
        const question = req.body.questions[questionKey];
        if (
          question.answerType === "uploadimageslect" &&
          req.files["uploadedImages"]
        ) {
          const files = req.files["uploadedImages"];
          const fileUrls = [];

          for (const file of files) {
            const filePath = file.path;
            const fileBuffer = fs.readFileSync(filePath);
            const originalName = path.basename(filePath);

            // Upload file to Sirv
            const url = await uploadMultiToSrv(fileBuffer, originalName);
            fileUrls.push(url);
          }

          uploadedFiles[questionKey] = fileUrls;
        }
      }
    }

    // Attach uploaded images to their respective questions
    const formattedQuestions = questions.map((q, index) => ({
      ...q,
      uploadedImages: uploadedFiles[index] || [],
    }));

    // Check if branches exist
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
        {
          title,
          questions: formattedQuestions,
          branches: branchIds,
          categories,
        },
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
        { title, questions: formattedQuestions, categories },
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
