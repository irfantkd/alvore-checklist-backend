const RouteModel = require("../models/Route.model");
const UserModel = require("../models/User.model");
const BranchModel = require("../models/Branch.model");
const { default: mongoose } = require("mongoose");

// Create a new route
const createRoute = async (req, res) => {
  try {
    const { userid } = req.body;
    const userobjid = new mongoose.Types.ObjectId(userid);
    const userlogin = await UserModel.findById(userobjid);
    if (!userlogin || userlogin.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create units." });
    }
    if (req.body.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a route",
      });
    }

    // Find user by username
    const user = await UserModel.findOne({ username: req.body.username });
    // Find branch by branchCode
    const branch = await BranchModel.findOne({
      branchCode: req.body.branchCode,
    });

    if (!user || !branch) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or branch code",
      });
    }

    const newRoute = await RouteModel.create({
      routeNumber: req.body.routeNumber,
      economicUnit: req.body.economicUnit,
      branch: branch._id,
      user: user._id,
    });

    res.status(201).json({
      success: true,
      message: "Route created successfully",
      data: newRoute,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create route",
      error: error.message,
    });
  }
};

// Get all routes
const getAllRoutes = async (req, res) => {
  try {
    const routes = await RouteModel.find()
      .populate("branch", "branchCode branchName")
      .populate("user", "username");

    res.status(200).json({
      success: true,
      data: routes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve routes",
      error: error.message,
    });
  }
};

// Get a single route by ID
const getRouteById = async (req, res) => {
  try {
    const route = await RouteModel.findById(req.params.id)
      .populate("branch", "branchCode branchName")
      .populate("user", "username");

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    res.status(200).json({
      success: true,
      data: route,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve route",
      error: error.message,
    });
  }
};

// Update a route by ID
const updateRoute = async (req, res) => {
  try {
    if (req.body.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update a route",
      });
    }

    // Optionally handle username and branchCode updates
    const user = req.body.username
      ? await UserModel.findOne({ username: req.body.username })
      : null;
    const branch = req.body.branchCode
      ? await BranchModel.findOne({ branchCode: req.body.branchCode })
      : null;

    const updatedData = {
      routeNumber: req.body.routeNumber,
      economicUnit: req.body.economicUnit,
    };

    if (user) updatedData.user = user._id;
    if (branch) updatedData.branch = branch._id;

    const updatedRoute = await RouteModel.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedRoute) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Route updated successfully",
      data: updatedRoute,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update route",
      error: error.message,
    });
  }
};

// Delete a route by ID
const deleteRoute = async (req, res) => {
  try {
    if (req.body.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete a route",
      });
    }

    const deletedRoute = await RouteModel.findByIdAndDelete(req.params.id);

    if (!deletedRoute) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Route deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete route",
      error: error.message,
    });
  }
};

// Export all methods
module.exports = {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
};
