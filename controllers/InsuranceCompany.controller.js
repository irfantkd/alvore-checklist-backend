const InsuranceCompanyModel = require("../models/InsuranceCompany.model");
const { default: mongoose } = require("mongoose");
const UserModel = require("../models/User.model");

// Create new insurance company
const createInsuranceCompany = async (req, res) => {
  try {
    const { userid } = req.body;
    const userobjid = new mongoose.Types.ObjectId(userid);
    const user = await UserModel.findById(userobjid);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create insurance companies." });
    }

    const { name } = req.body;
    const newCompany = await InsuranceCompanyModel.create({ name });

    res.status(201).json({
      success: true,
      message: "Insurance company created successfully",
      data: newCompany,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create insurance company",
      error: error.message,
    });
  }
};

// Get all active insurance companies
const getAllInsuranceCompanies = async (req, res) => {
  try {
    const companies = await InsuranceCompanyModel.find({ isActive: true })
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve insurance companies",
      error: error.message,
    });
  }
};

// Delete an insurance company
const deleteInsuranceCompany = async (req, res) => {
  try {
    const { userid } = req.body; // Get user ID from request body
    const userobjid = new mongoose.Types.ObjectId(userid);
    const user = await UserModel.findById(userobjid);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete insurance companies." });
    }

    const { id } = req.params; // Get insurance company ID from URL parameters
    const deletedCompany = await InsuranceCompanyModel.findByIdAndDelete(id);

    if (!deletedCompany) {
      return res.status(404).json({ message: "Insurance company not found." });
    }

    res.status(200).json({
      success: true,
      message: "Insurance company deleted successfully.",
      data: deletedCompany,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete insurance company",
      error: error.message,
    });
  }
};

module.exports = {
  createInsuranceCompany,
  getAllInsuranceCompanies,
  deleteInsuranceCompany,
}; 