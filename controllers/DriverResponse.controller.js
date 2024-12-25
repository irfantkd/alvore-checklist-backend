const DriverResponse = require("../models/DriverResponse.model"); // Adjust the path
const ChecklistModel = require("../models/Checklist.model");
const UserModel = require("../models/User.model");
const { default: mongoose } = require("mongoose");

const createDriverResponse = async (req, res) => {
  try {
    const { userid, answers } = req.body; // Extract user ID and answers
    const checklistId = req.params.id; // Get checklist ID from params

    // Convert IDs to ObjectId
    const checklistobjId = new mongoose.Types.ObjectId(checklistId);
    const userobjid = new mongoose.Types.ObjectId(userid);

    // Verify checklist exists
    const checklists = await ChecklistModel.findById(checklistobjId);

    if (!checklists) {
      return res.status(404).json({ message: "Checklist not found." });
    }

    // Check if the driver has already submitted a response
    const existingResponse = await DriverResponse.findOne({
      checklistId: checklistobjId, // Fixed variable naming
      driverId: userobjid,
    });
    if (existingResponse) {
      return res
        .status(400)
        .json({ message: "You have already submitted this checklist." });
    }

    // Save the driver response
    const driverResponse = new DriverResponse({
      checklistId: checklistobjId,
      driverId: userobjid,
      answers,
    });
    await driverResponse.save();

    res.status(201).json({
      message: "Driver response submitted successfully",
      driverResponse,
    });
  } catch (error) {
    console.error(error); // Log detailed error
    res.status(500).json({
      message: "Error creating driver response",
      error: error.message,
    });
  }
};

// Get all driver responses for a specific checklist
const getResponsesByChecklist = async (req, res) => {
  try {
    const checklistId = req.params.id;
    const checklistobjId = new mongoose.Types.ObjectId(checklistId);
    const responses = await DriverResponse.find({ checklistId: checklistobjId })
      .populate("driverId", "firstname lastname username")
      .populate("checklistId", "title");

    if (!responses.length) {
      return res
        .status(404)
        .json({ message: "No responses found for this checklist" });
    }

    res.status(200).json(responses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching responses", error });
  }
};

// Get all responses by a specific driver
// const getResponsesByDriver = async (req, res) => {
//   try {
//     const { driverId } = req.params;

//     const responses = await DriverResponse.find({ driverId })
//       .populate("checklistId", "title")
//       .populate("driverId", "firstname lastname username");

//     if (!responses.length) {
//       return res
//         .status(404)
//         .json({ message: "No responses found for this driver" });
//     }

//     res.status(200).json(responses);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching responses", error });
//   }
// };

module.exports = {
  createDriverResponse,
  getResponsesByChecklist,
  // getResponsesByDriver,
};
