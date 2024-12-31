const mongoose = require("mongoose");
const DriverResponse = require("../models/DriverResponse.model");
const ChecklistModel = require("../models/Checklist.model");
const UserModel = require("../models/User.model");

// Create a new driver response
const createDriverResponse = async (req, res) => {
  try {
    const { userid, answers } = req.body;
    const checklistId = req.params.id;

    const checklistobjId = new mongoose.Types.ObjectId(checklistId);
    const userobjid = new mongoose.Types.ObjectId(userid);

    const checklist = await ChecklistModel.findById(checklistobjId);
    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found." });
    }

    const user = await UserModel.findById(userobjid);
    if (!user || user.role !== "driver") {
      return res
        .status(403)
        .json({ message: "Only drivers can submit responses." });
    }

    const existingResponse = await DriverResponse.findOne({
      checklistId: checklistobjId,
      driverId: userobjid,
    });
    if (existingResponse) {
      return res
        .status(400)
        .json({ message: "You have already submitted this checklist." });
    }

    const checklistQuestionIds = checklist.questions.map((q) =>
      q._id.toString()
    );
    for (const answer of answers) {
      // Ensure the questionId is present in the checklist's questions
      if (!checklistQuestionIds.includes(answer.questionId)) {
        return res.status(400).json({
          message: `Invalid questionId: ${answer.questionId} does not match the checklist questions.`,
        });
      }

      // Additional validations can be added based on the answerType
      const question = checklist.questions.find(
        (q) => q._id.toString() === answer.questionId
      );
      if (question) {
        // Ensure the answer type matches the expected type (e.g., dropdown should have one of the choices)
        if (
          question.answerType === "dropdown" ||
          question.answerType === "mcqs"
        ) {
          if (!question.choices.includes(answer.answer)) {
            return res.status(400).json({
              message: `Invalid answer: ${answer.answer} is not a valid choice for questionId ${answer.questionId}.`,
            });
          }
        }
      }
    }

    // Save the driver response
    const driverResponse = new DriverResponse({
      checklistId: checklistobjId,
      driverId: userobjid,
      answers,
    });
    await driverResponse.save();

    res.status(201).json({
      message: "Driver response submitted successfully.",
      driverResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating driver response.",
      error: error.message,
    });
  }
};

// Update an existing driver response
const updateDriverResponse = async (req, res) => {
  try {
    const responseId = req.params.responseId;
    const { answers } = req.body;

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

    const checklistQuestionIds = response.checklistId.questions.map((q) =>
      q._id.toString()
    );
    for (const answer of answers) {
      if (!checklistQuestionIds.includes(answer.questionId)) {
        return res.status(400).json({
          message: `Invalid questionId: ${answer.questionId} does not match the checklist questions.`,
        });
      }
    }

    response.answers = answers;
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

    const responses = await DriverResponse.find({ checklistId: checklistobjId })
      .populate("driverId", "firstname lastname username role")
      .populate("checklistId", "title category branch");

    if (!responses.length) {
      return res
        .status(404)
        .json({ message: "No responses found for this checklist." });
    }

    res.status(200).json(responses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching responses.", error });
  }
};

// Get all responses by a driver
const getResponsesByDriver = async (req, res) => {
  try {
    const driverId = req.params.driverId;

    const responses = await DriverResponse.find({ driverId })
      .populate("checklistId", "title category branch")
      .populate("driverId", "firstname lastname username role");

    if (!responses.length) {
      return res
        .status(404)
        .json({ message: "No responses found for this driver." });
    }

    res.status(200).json(responses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching responses.", error });
  }
};

module.exports = {
  createDriverResponse,
  updateDriverResponse,
  getResponsesByChecklist,
  getResponsesByDriver,
};
