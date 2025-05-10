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
    const { checklistId, driverId, answers, branches, units, routes } = req.body;

    // Fetch the checklist to get question labels
    const checklist = await ChecklistModel.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found" });
    }

    // Enhance answers with question labels
    const enhancedAnswers = answers.map(answer => {
      const question = checklist.questions.find(q => 
        q._id.toString() === answer.questionId.toString()
      );
      
      return {
        ...answer,
        questionLabel: question ? question.label : "Unknown Question" // Add question label
      };
    });

    const driverResponse = new DriverResponse({
      checklistId,
      driverId,
      answers: enhancedAnswers, // Use enhanced answers with labels
      branches,
      units,
      routes,
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
      .populate("checklistId", "title category branch questions") // Include questions to get labels
      .populate({
        path: "units",
        select: "unitNumber",
      })
      .populate({
        path: "branches",
        select: "branchCode",
      })
      .populate({
        path: "routes",
        select: "routeNumber",
      })
      .sort({ createdAt: -1 });

    if (!responses.length) {
      return res.status(404).json({ message: "No responses found." });
    }

    // Enhance each response with question labels
    const enhancedResponses = responses.map(response => {
      const responseObj = response.toObject();
      
      // Add question labels to each answer
      if (responseObj.answers && responseObj.checklistId && responseObj.checklistId.questions) {
        responseObj.answers = responseObj.answers.map(answer => {
          const question = responseObj.checklistId.questions.find(
            q => q._id.toString() === answer.questionId.toString()
          );
          
          return {
            ...answer,
            questionLabel: question ? question.label : "Unknown Question"
          };
        });
      }
      
      return responseObj;
    });

    res.status(200).json(enhancedResponses);
  } catch (error) {
    console.error("Error fetching all responses:", error);
    res.status(500).json({ message: "Error fetching all responses.", error });
  }
};

// Updated Driver response
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

    // Validate the question IDs in the answers and add labels
    const checklistQuestions = response.checklistId.questions;
    const checklistQuestionIds = checklistQuestions.map(q => q._id.toString());
    
    const enhancedAnswers = [];
    
    for (const answer of answers) {
      if (!checklistQuestionIds.includes(answer.questionId)) {
        return res.status(400).json({
          message: `Invalid questionId: ${answer.questionId} does not match the checklist questions.`,
        });
      }

      // Find the corresponding question to get its label
      const question = checklistQuestions.find(
        q => q._id.toString() === answer.questionId
      );
      
      // Create enhanced answer with label
      const enhancedAnswer = {
        ...answer,
        questionLabel: question ? question.label : "Unknown Question"
      };

      // Handle image-based answers
      if (
        ["image", "signature", "uploadimageslect", "takepicture"].includes(
          question?.answerType
        )
      ) {
        const uploadedFiles = [];
        if (req.files && req.files["images"]) {
          for (const file of req.files["images"]) {
            const filePath = file.path;
            const fileBuffer = fs.readFileSync(filePath);
            const originalName = path.basename(filePath);

            // Upload to the server
            const url = await uploadMultiToSrv(fileBuffer, originalName);
            uploadedFiles.push(url);
          }
        }

        if (uploadedFiles.length > 0) {
          if (!enhancedAnswer.uploadedImages) {
            enhancedAnswer.uploadedImages = [];
          }
          enhancedAnswer.uploadedImages.push(...uploadedFiles);
        }
      }
      
      enhancedAnswers.push(enhancedAnswer);
    }

    // Update the branches, units and routes if provided
    if (branches) {
      response.branches = branches.map(
        branch => new mongoose.Types.ObjectId(branch)
      );
    }
    if (routes) {
      response.routes = routes.map(
        route => new mongoose.Types.ObjectId(route)
      );
    }
    if (units) {
      response.units = units.map(unit => new mongoose.Types.ObjectId(unit));
    }

    // Update the response answers
    response.answers = enhancedAnswers;

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
    console.log("Fetching responses for checklist ID:", checklistId);

    // First get the checklist to access question labels
    const checklist = await ChecklistModel.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found." });
    }

    const responses = await DriverResponse.find({ checklistId })
      .populate("driverId", "firstname lastname username role")
      .populate("checklistId", "title")
      .populate("branches")
      .populate("units")
      .populate("routes");

    console.log("Responses found:", responses);

    if (!responses.length) {
      return res.status(404).json({ message: "No responses found for this checklist." });
    }

    // Enhance responses with question labels
    const enhancedResponses = responses.map(response => {
      const responseObj = response.toObject();
      
      // Add question labels to each answer
      if (responseObj.answers) {
        responseObj.answers = responseObj.answers.map(answer => {
          const question = checklist.questions.find(
            q => q._id.toString() === answer.questionId.toString()
          );
          
          return {
            ...answer,
            questionLabel: question ? question.label : "Unknown Question"
          };
        });
      }
      
      return responseObj;
    });

    res.status(200).json(enhancedResponses);
  } catch (error) {
    console.error("Error fetching responses by checklist:", error);
    res.status(500).json({ message: "Error fetching responses.", error: error.message });
  }
};

// Get all responses by a driver
const getResponsesByDriver = async (req, res) => {
  try {
    const driverId = req.params.driverId;

    // Find responses by driver
    const responses = await DriverResponse.find({ driverId })
      .populate("checklistId", "title category branch questions") // Include questions to get labels
      .populate("driverId", "firstname lastname username role")
      .populate({
        path: "units",
        select: "unitNumber",
      })
      .populate({
        path: "branches",
        select: "branchCode",
      })
      .populate({
        path: "routes",
        select: "routeNumber",
      })
      .sort({ createdAt: -1 });

    if (!responses.length) {
      return res
        .status(404)
        .json({ message: "No responses found for this driver." });
    }

    // Enhance each response with question labels
    const enhancedResponses = responses.map(response => {
      const responseObj = response.toObject();
      
      // Add question labels to each answer
      if (responseObj.answers && responseObj.checklistId && responseObj.checklistId.questions) {
        responseObj.answers = responseObj.answers.map(answer => {
          const question = responseObj.checklistId.questions.find(
            q => q._id.toString() === answer.questionId.toString()
          );
          
          return {
            ...answer,
            questionLabel: question ? question.label : "Unknown Question"
          };
        });
      }
      
      return responseObj;
    });

    res.status(200).json(enhancedResponses);
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