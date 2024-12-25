const { default: mongoose } = require("mongoose");
const BranchModel = require("../models/Branch.model");
const CarModel = require("../models/Car.model");
const { uploadToSirv } = require("../utils/sirvUploader");
const UserModel = require("../models/User.model");

// Create a new car
// const createCar = async (req, res) => {
//   try {
//     if (req.body.role !== "admin") {
//       return res.status(403).json({
//         success: false,
//         message: "You are not authorized to create a car",
//       });
//     }

//     // Ensure both files are uploaded
//     // const vehicleCardFile = req.files.vehicleCardUpload?.[0];
//     const insuranceFile = req.files.insuranceUpload?.[0];

//     if (!insuranceFile) {
//       return res.status(400).json({
//         success: false,
//         message: "Both vehicleCardUpload and insuranceUpload are required",
//       });
//     }

//     // Upload files to Sirv
//     // const vehicleCardUrl = await uploadToSirv(
//     //   vehicleCardFile.buffer,
//     //   vehicleCardFile.originalname
//     // );
//     const insuranceUrl = await uploadToSirv(
//       insuranceFile.buffer,
//       insuranceFile.originalname
//     );

//     // console.log("Vehicle Card URL:", vehicleCardUrl);
//     console.log("Insurance URL:", insuranceUrl);

//     // Create the car record in the database
//     const newCar = await CarModel.create({
//       // vehicleCardUpload: vehicleCardUrl,
//       insuranceUpload: insuranceUrl,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Car created successfully",
//       data: newCar,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: "Failed to create car",
//       error: error.message,
//     });
//   }
// };
// const createCar = async (req, res) => {
//   try {
//     // Check if the user is an admin
//     if (req.body.role !== "admin") {
//       return res.status(403).json({
//         success: false,
//         message: "You are not authorized to create a car",
//       });
//     }

//     // Extract data from the request body
//     const {
//       unitNumber,
//       plate,
//       brand,
//       model,
//       color,
//       year,
//       insuranceUpload,
//       insuranceCompany,
//       branch,
//       vehicleCardUpload,
//     } = req.body;

//     // Validate required fields
//     if (
//       !unitNumber ||
//       !plate ||
//       !brand ||
//       !model ||
//       !color ||
//       !year ||
//       !insuranceCompany ||
//       !branch
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be provided",
//       });
//     }

//     // Create the car record in the database
//     const newCar = await CarModel.create({
//       unitNumber,
//       plate,
//       brand,
//       model,
//       color,
//       year,
//       insuranceUpload,
//       insuranceCompany,
//       branch,
//       vehicleCardUpload,
//     });

//     // Respond with success
//     res.status(201).json({
//       success: true,
//       message: "Car created successfully",
//       data: newCar,
//     });
//   } catch (error) {
//     // Handle errors
//     res.status(400).json({
//       success: false,
//       message: "Failed to create car",
//       error: error.message,
//     });
//   }
// };
const createCar = async (req, res) => {
  try {
    const { userid } = req.body;
    const userobjid = new mongoose.Types.ObjectId(userid);
    const user = await UserModel.findById(userobjid);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create units." });
    }

    // Check if the user is an admin
    if (req.body.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a car",
      });
    }

    // Extract data from the request body
    const {
      unitNumber,
      plate,
      brand,
      model,
      color,
      year,
      insuranceUpload,
      insuranceCompany,
      branchCode, // Receive branchCode instead of branch ID
      vehicleCardUpload,
    } = req.body;

    // Validate required fields
    if (
      !unitNumber ||
      !plate ||
      !brand ||
      !model ||
      !color ||
      !year ||
      !insuranceCompany ||
      !branchCode // Ensure branchCode is provided
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Find the branch by branchCode
    const branch = await BranchModel.findOne({ branchCode });
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: `Branch with code ${branchCode} not found`,
      });
    }

    // Create the car record in the database
    const newCar = await CarModel.create({
      unitNumber,
      plate,
      brand,
      model,
      color,
      year,
      insuranceUpload,
      insuranceCompany,
      branch: branch._id, // Save the branch ID
      vehicleCardUpload,
    });

    // Respond with success
    res.status(201).json({
      success: true,
      message: "Car created successfully",
      data: newCar,
    });
  } catch (error) {
    // Handle errors
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
    const cars = await CarModel.find();
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
    const car = await CarModel.findById(req.params.id);
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
