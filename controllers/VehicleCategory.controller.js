const VehicleCategoryModel = require("../models/VehicleCategory.model");

// Create new category
const createCategory = async (req, res) => {
  try {
    const { categoryname, userid } = req.body;

    // Enhanced validation
    if (!categoryname || categoryname.trim().length === 0) {
      return res.status(400).json({ 
        message: "Category name is required and cannot be empty" 
      });
    }

    // Check if category already exists (case-insensitive)
    const existingCategory = await VehicleCategoryModel.findOne({ 
      categoryname: { $regex: new RegExp(`^${categoryname.trim()}$`, 'i') }
    });
    
    if (existingCategory) {
      return res.status(400).json({ 
        message: "Category already exists" 
      });
    }

    const category = new VehicleCategoryModel({
      categoryname: categoryname.trim(),
      ...(userid && { createdBy: userid })
    });

    await category.save();
    
    res.status(201).json({ 
      success: true,
      message: "Category created successfully", 
      category 
    });
  } catch (error) {
    console.error("Category creation error:", error);
    
    // Handle specific error types
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "Category name must be unique" 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Error creating category", 
      error: error.message 
    });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await VehicleCategoryModel.find()
      .sort({ name: 1 })
      .populate("createdBy", "firstname lastname");
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await VehicleCategoryModel.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  deleteCategory,
}; 