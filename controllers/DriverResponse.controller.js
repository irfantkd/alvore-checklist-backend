const mongoose = require("mongoose");
const DriverResponse = require("../models/DriverResponse.model");
const ChecklistModel = require("../models/Checklist.model");
const BranchModel = require("../models/Branch.model");
const CarModel = require("../models/Car.model");
const UserModel = require("../models/User.model");
const fs = require("fs");
const path = require("path");
const { uploadMultiToSrv } = require("../utils/sirvUploader"); // Assuming you have an upload service
const RouteModel = require("../models/Route.model");

// Create a new driver response

const createDriverResponse = async (req, res) => {
  try {
    const { userid, answers, branches, units, routes } = req.body; // Extracting data from the request body
    const checklistId = req.params.id; // Checklist ID from URL params

    // Convert IDs to ObjectId for MongoDB queries
    const checklistObjId = new mongoose.Types.ObjectId(checklistId);
    const userObjId = new mongoose.Types.ObjectId(userid);

    // Fetch the checklist and validate its existence
    const checklist = await ChecklistModel.findById(checklistObjId);
    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found." });
    }

    // Extract question IDs from the checklist
    const checklistQuestionIds = checklist.questions.map((q) => q._id.toString());

    // Prepare an array for uploaded image URLs
    const uploadedFiles = [];

    // Validate and process the answers
    for (const answer of answers) {
      // Ensure the questionId exists in the checklist's questions
      if (!checklistQuestionIds.includes(answer.questionId)) {
        return res.status(400).json({
          message: `Invalid questionId: ${answer.questionId} does not match the checklist questions.`,
        });
      }

      // Process different answer types based on the question type
      const question = checklist.questions.find((q) => q._id.toString() === answer.questionId);
      if (question) {
        // Validate dropdown/mcqs
        if (["dropdown", "mcqs"].includes(question.answerType)) {
          const validChoices = question.choices.map((choice) => choice.text);
          if (Array.isArray(answer.answer)) {
            const invalidAnswers = answer.answer.filter((ans) => !validChoices.includes(ans));
            if (invalidAnswers.length > 0) {
              return res.status(400).json({
                message: `Invalid answers: ${invalidAnswers.join(",")} are not valid choices for questionId ${answer.questionId}.`,
              });
            }
          } else if (!validChoices.includes(answer.answer)) {
            return res.status(400).json({
              message: `Invalid answer: ${answer.answer} is not a valid choice for questionId ${answer.questionId}.`,
            });
          }
        }

        // Handle other answer types like text, date, etc.
      }

      // Handle image file uploads if necessary (upload to server and store URLs)
      if (["image", "signature"].includes(question.answerType)) {
        if (req.files && req.files["uploadedImages"]) {
          for (const file of req.files["uploadedImages"]) {
            const filePath = file.path;
            const fileBuffer = fs.readFileSync(filePath);
            const originalName = path.basename(filePath);
            const url = await uploadMultiToSrv(fileBuffer, originalName); // Upload the image and get URL
            uploadedFiles.push(url);
          }
        }
      }

      // Attach uploaded image URLs to the answer (if any)
      if (uploadedFiles.length > 0) {
        if (!answer.uploadedImages) {
          answer.uploadedImages = [];
        }
        answer.uploadedImages.push(...uploadedFiles);
      }
    }

    // Resolve the branches and units based routes on user input
    const resolvedBranches = [];
    for (const branchCode of branches) {
      const branch = await BranchModel.findOne({ branchCode: branchCode });
      if (branch) {
        resolvedBranches.push(branch._id);
      } else {
        return res.status(400).json({ message: `Branch with code ${branchCode} not found.` });
      }
    }

    const resolvedRoutes = [];
    for (const routeNumber of routes) {
      const route = await RouteModel.findOne({ routeNumber: routeNumber });
      if (route) {
        resolvedRoutes.push(route._id);
      } else {
        return res.status(400).json({ message: `Route with code ${routeNumber} not found.` });
      }
    }

    const resolvedUnits = [];
    for (const unitNumber of units) {
      const unit = await CarModel.findOne({ unitNumber: unitNumber });
      if (unit) {
        resolvedUnits.push(unit._id);
      } else {
        return res.status(400).json({ message: `Unit with number ${unitNumber} not found.` });
      }
    }

    // Save the driver response to the database
    const driverResponse = new DriverResponse({
      checklistId: checklistObjId,
      driverId: userObjId,
      branches: resolvedBranches,
      units: resolvedUnits,
      routes: resolvedRoutes,
      answers,
    });

    await driverResponse.save();

    res.status(201).json({
      message: "Driver response submitted successfully.",
      driverResponse,
    });
  } catch (error) {
    console.error("Error creating driver response:", error);
    res.status(500).json({
      message: "Internal server error while creating driver response.",
      error: error.message,
    });
  }
};


const getAllResponses = async (req, res) => {
  try {
    // Fetch all responses
    const responses = await DriverResponse.find()
      .populate("driverId", "firstname lastname username role")
      .populate("checklistId", "title category branch")
      .populate({
        path: "units", // Populating units (cars)
        select: "unitNumber", // Assuming unitNumber is the field on the Car model
      })
      .populate({
        path: "branches", // Populating branches
        select: "branchCode", // Assuming branchCode is the field on the Branch model
      })
      .populate({
        path: "routes", // Populating branches
        select: "routeNumber", // Assuming branchCode is the field on the Branch model
      })
      .sort({ createdAt: -1 }); // Sorting by createdAt in descending order (newest first)

    if (!responses.length) {
      return res.status(404).json({ message: "No responses found." });
    }

    res.status(200).json(responses);
  } catch (error) {
    console.error("Error fetching all responses:", error);
    res.status(500).json({ message: "Error fetching all responses.", error });
  }
};

// Updated Driver responce
const updateDriverResponse = async (req, res) => {
  try {
    const responseId = req.params.responseId;
    const { answers, branches, units, routes } = req.body;

    // Find the existing response
    const response = await DriverResponse.findById(responseId).populate(
      "checklistId"
    );

    if (!response) {
      return res.status(404).json({ message: "Driver response not found." });
    }

    // Verify the user making the request is the response owner
    if (response.driverId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to update this response.",
      });
    }

    // Validate the question IDs in the answers
    const checklistQuestionIds = response.checklistId.questions.map((q) =>
      q._id.toString()
    );

    for (const answer of answers) {
      if (!checklistQuestionIds.includes(answer.questionId)) {
        return res.status(400).json({
          message: `Invalid questionId: ${answer.questionId} does not match the checklist questions.`,
        });
      }

      // Handle image-based answers
      if (
        ["image", "signature", "uploadimageslect", "takepicture"].includes(
          response.checklistId.questions.find(
            (q) => q._id.toString() === answer.questionId
          )?.answerType
        )
      ) {
        const uploadedFiles = [];
        if (req.files && req.files["images"]) {
          // Assuming the key for the images field is "images"
          for (const file of req.files["images"]) {
            const filePath = file.path;
            const fileBuffer = fs.readFileSync(filePath);
            const originalName = path.basename(filePath); // Extract the filename

            // Upload to the server (adjust this function as needed)
            const url = await uploadMultiToSrv(fileBuffer, originalName);
            uploadedFiles.push(url);
          }
        }

        if (uploadedFiles.length > 0) {
          if (!answer.uploadedImages) {
            answer.uploadedImages = [];
          }
          answer.uploadedImages.push(...uploadedFiles);
        }
      }
    }

    // Update the branches and units and routes if they are provided
    if (branches) {
      response.branches = branches.map(
        (branch) => new mongoose.Types.ObjectId(branch)
      );
    }
    if (routes) {
      response.routes = routes.map(
        (route) => new mongoose.Types.ObjectId(route)
      );
    }
    if (units) {
      response.units = units.map((unit) => new mongoose.Types.ObjectId(unit));
    }

    // Update the response answers
    response.answers = answers;

    // Save the updated driver response
    await response.save();

    res.status(200).json({
      message: "Driver response updated successfully.",
      response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating driver response.",
      error: error.message,
    });
  }
};

// Get all responses for a checklist
const getResponsesByChecklist = async (req, res) => {
  try {
    const checklistId = req.params.id;
    const checklistobjId = new mongoose.Types.ObjectId(checklistId);

    // Find responses by checklist
    const responses = await DriverResponse.find({ checklistId: checklistobjId })
      .populate("driverId", "firstname lastname username role")
      .populate("checklistId", "title category branch")
      .populate({
        path: "units", // Populating units (cars)
        select: "unitNumber", // Assuming unitNumber is the field on the Car model
      })
      .populate({
        path: "branches", // Populating branches
        select: "branchCode", // Assuming branchCode is the field on the Branch model
      })
      .populate({
        path: "routes", // Populating branches
        select: "routeNumber", // Assuming branchCode is the field on the Branch model
      })
      .sort({ createdAt: -1 }); // Sorting by createdAt in descending order (newest first)

    if (!responses.length) {
      return res
        .status(404)
        .json({ message: "No responses found for this checklist." });
    }

    res.status(200).json(responses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching responses.", error });
  }
};

// Get all responses by a driver
const getResponsesByDriver = async (req, res) => {
  try {
    const driverId = req.params.driverId;

    // Find responses by driver
    const responses = await DriverResponse.find({ driverId })
      .populate("checklistId", "title category branch")
      .populate("driverId", "firstname lastname username role")
      .populate({
        path: "units", // Populating units (cars)
        select: "unitNumber", // Assuming unitNumber is the field on the Car model
      })
      .populate({
        path: "branches", // Populating branches
        select: "branchCode", // Assuming branchCode is the field on the Branch model
      })
      .populate({
        path: "routes",
        select: "routeNumber",
      })
      .sort({ createdAt: -1 }); // Sorting by createdAt in descending order (newest first)

    if (!responses.length) {
      return res
        .status(404)
        .json({ message: "No responses found for this driver." });
    }

    res.status(200).json(responses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching responses.", error });
  }
};

module.exports = {
  createDriverResponse,
  updateDriverResponse,
  getResponsesByChecklist,
  getResponsesByDriver,
  getAllResponses,
};
