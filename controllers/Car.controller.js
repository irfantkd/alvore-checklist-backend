const { default: mongoose } = require("mongoose");
const BranchModel = require("../models/Branch.model");
const CarModel = require("../models/Car.model");
const { uploadToSirv, uploadMultiToSrv } = require("../utils/sirvUploader");
const UserModel = require("../models/User.model");
const fs = require("fs");
const path = require("path");
const VehicleCategoryModel = require("../models/VehicleCategory.model");
const InsuranceCompanyModel = require("../models/InsuranceCompany.model");

// Create a new car
const createCar = async (req, res) => {
  try {
    const { userid, insuranceCompany } = req.body;
    const userobjid = new mongoose.Types.ObjectId(userid);
    const user = await UserModel.findById(userobjid);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create units." });
    }

    // Handle file uploads
    const uploadedFiles = [];
    if (req.files) {
      for (const key in req.files) {
        const singleFile = req.files[key][0];
        const filePath = singleFile.path;
        const fileBuffer = fs.readFileSync(filePath);
        const originalName = path.basename(filePath);
        const url = await uploadMultiToSrv(fileBuffer, originalName);
        uploadedFiles.push({ field: key, url });
        
        // Clean up temporary file
        fs.unlinkSync(filePath);
      }
    }

    // Get URLs for specific uploads
    const vehicleCardUrl = uploadedFiles.find(
      (file) => file.field === "vehicleCardUpload"
    )?.url;
    const insuranceUrl = uploadedFiles.find(
      (file) => file.field === "insuranceUpload"
    )?.url;

    // Extract and validate required fields
    const {
      unitNumber,
      plate,
      brand,
      model,
      color,
      year,
      branchCode,
      category,
    } = req.body;

    // Validate all required fields are present
    if (!unitNumber || !plate || !brand || !model || !color || !year || 
        !branchCode || !category) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Find branch by branchCode
    const branch = await BranchModel.findOne({ branchCode });
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: `Branch with code ${branchCode} not found`,
      });
    }

    // Find category
    let categoryDoc;
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryDoc = await VehicleCategoryModel.findById(category);
    } else {
      categoryDoc = await VehicleCategoryModel.findOne({ categoryname: category });
    }

    if (!categoryDoc) {
      return res.status(404).json({
        success: false,
        message: `Category "${category}" not found`,
      });
    }

    // Find insurance company by name (case-insensitive)
    let insuranceDoc;
    if (insuranceCompany) {
      insuranceDoc = await InsuranceCompanyModel.findOne({
        name: { $regex: new RegExp(`^${insuranceCompany}$`, 'i') }
      });
    }

    // Get list of available companies for error message if not found
    if (!insuranceDoc) {
      const availableCompanies = await InsuranceCompanyModel.find({}, 'name')
        .sort({ name: 1 });
      const companyList = availableCompanies.map(c => c.name).join(', ');

      return res.status(404).json({
        success: false,
        message: `Insurance company "${insuranceCompany}" not found. Available companies: ${companyList}`,
      });
    }

    const newCar = await CarModel.create({
      unitNumber,
      plate,
      brand,
      model,
      color,
      year,
      insuranceCompany: insuranceDoc._id,
      branch: branch._id,
      category: categoryDoc._id,
      insuranceUpload: insuranceUrl,
      vehicleCardUpload: vehicleCardUrl,
    });

    res.status(201).json({
      success: true,
      message: "Car created successfully",
      data: newCar,
    });
  } catch (error) {
    console.error("Car creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create car",
      error: error.message,
    });
  }
};

// Get all cars
const getAllCars = async (req, res) => {
  try {
    const cars = await CarModel.find()
      .sort({ createdAt: -1 })
      .populate("branch", "branchCode")
      .populate("insuranceCompany", "name")
      .exec();

    res.status(200).json({
      success: true,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve cars",
      error: error.message,
    });
  }
};

// Get a single car by ID
const getCarById = async (req, res) => {
  try {
    const car = await CarModel.findById(req.params.id)
      .populate("branch", "branchCode") // Populate branch field with branchCode
      .exec();
    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }
    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve car",
      error: error.message,
    });
  }
};

// Update a car by ID
const updateCar = async (req, res) => {
  try {
    if (req.body.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update a car",
      });
    }

    const updatedCar = await CarModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedCar) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Car updated successfully",
      data: updatedCar,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update car",
      error: error.message,
    });
  }
};

// Delete a car by ID
const deleteCar = async (req, res) => {
  try {
    if (req.body.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete a car",
      });
    }

    const deletedCar = await CarModel.findByIdAndDelete(req.params.id);
    if (!deletedCar) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete car",
      error: error.message,
    });
  }
};

// Export all methods
module.exports = {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
};
