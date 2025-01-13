const mongoose = require("mongoose");
const DriverResponse = require("../models/DriverResponse.model");
const ChecklistModel = require("../models/Checklist.model");
const UserModel = require("../models/User.model");

// Create a new driver response

const createDriverResponse = async (req, res) => {
  try {
    const { userid, answers } = req.body; // Extracting data from the request body
    const checklistId = req.params.id; // Chec  klist ID from URL params

    // Convert IDs to ObjectId for MongoDB queries
    const checklistObjId = new mongoose.Types.ObjectId(checklistId);
    const userObjId = new mongoose.Types.ObjectId(userid);

    // Fetch the checklist and validate its existence
    const checklist = await ChecklistModel.findById(checklistObjId);
    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found." });
    }

    // Fetch the user and validate their role
    // const user = await UserModel.findById(userObjId);
    // if (!user || user.role !== "driver") {
    //   return res
    //     .status(403)
    //     .json({ message: "Only drivers can submit responses." });
    // }

    // Check for duplicate responses for the same checklist and driver
    // const existingResponse = await DriverResponse.findOne({
    //   checklistId: checklistObjId,
    //   driverId: userObjId,
    // });
    // if (existingResponse) {
    //   return res
    //     .status(400)
    //     .json({ message: "You have already submitted this checklist." });
    // }

    // Extract question IDs from the checklist
    const checklistQuestionIds = checklist.questions.map((q) =>
      q._id.toString()
    );

    // Prepare an array for image URLs

    // Validate each answer
    for (const answer of answers) {
      // Ensure the questionId exists in the checklist's questions
      if (!checklistQuestionIds.includes(answer.questionId)) {
        return res.status(400).json({
          message: `Invalid questionId: ${answer.questionId} does not match the checklist questions.`,
        });
      }

      // Fetch the corresponding question from the checklist
      const question = checklist.questions.find(
        (q) => q._id.toString() === answer.questionId
      );

      if (question) {
        // Handle validation for different answer types
        if (
          question.answerType === "dropdown" ||
          question.answerType === "mcqs"
        ) {
          const validChoices = question.choices.map((choice) => choice.text);

          // Handle single or multiple answers for mcqs
          if (Array.isArray(answer.answer)) {
            const invalidAnswers = answer.answer.filter(
              (ans) => !validChoices.includes(ans)
            );
            if (invalidAnswers.length > 0) {
              return res.status(400).json({
                message: `Invalid answers: ${invalidAnswers.join(
                  ","
                )} are not valid choices for questionId ${answer.questionId}.`,
              });
            }
          } else {
            // Single answer validation
            if (!validChoices.includes(answer.answer)) {
              return res.status(400).json({
                message: `Invalid answer: ${answer.answer} is not a valid choice for questionId ${answer.questionId}.`,
              });
            }
          }
        }

        if (question.answerType === "text") {
          if (!answer.answer || typeof answer.answer !== "string") {
            return res.status(400).json({
              message: `Invalid text answer for questionId ${answer.questionId}.`,
            });
          }
        }

        if (question.answerType === "date") {
          if (!Date.parse(answer.answer)) {
            return res.status(400).json({
              message: `Invalid date format for questionId ${answer.questionId}.`,
            });
          }
        }

        if (question.answerType === "multi-select") {
          const validChoices = question.choices.map((choice) => choice.text);
          const invalidAnswers = answer.answer.filter(
            (ans) => !validChoices.includes(ans)
          );
          if (invalidAnswers.length > 0) {
            return res.status(400).json({
              message: `Invalid answers: ${invalidAnswers.join(
                ","
              )} are not valid choices for questionId ${answer.questionId}.`,
            });
          }
        }
        console.log("question.answerType", question.answerType);

        if (
          question.answerType === "signature" ||
          question.answerType === "image" ||
          question.answerType === "uploadimageslect"
        ) {
          // Handle multiple image uploads
          const uploadedFiles = [];
          if (req.files && req.files["images"]) {
            // Assuming the key for the images field is "images"
            for (const file of req.files["images"]) {
              const filePath = file.path;
              const fileBuffer = fs.readFileSync(filePath);
              const originalName = path.basename(filePath); // Extract the filename

              // Call upload function to Sirv
              const url = await uploadMultiToSrv(fileBuffer, originalName);
              uploadedFiles.push(url);
            }
          }

          if (uploadedFiles.length > 0) {
            // Add the image URLs to the answers
            if (!answer.uploadedImages) {
              answer.uploadedImages = [];
            }
            answer.uploadedImages.push(...uploadedFiles);
          }
        }
      }
    }

    // Save the driver response to the database
    const driverResponse = new DriverResponse({
      checklistId: checklistObjId,
      driverId: userObjId,
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

// Update an existing driver response
// const updateDriverResponse = async (req, res) => {
//   try {
//     const responseId = req.params.responseId;
//     const { answers } = req.body;

//     const response = await DriverResponse.findById(responseId).populate(
//       "checklistId"
//     );

//     if (!response) {
//       return res.status(404).json({ message: "Driver response not found." });
//     }

//     // Verify the user making the request is the response owner
//     if (response.driverId.toString() !== req.user.id) {
//       return res.status(403).json({
//         message: "You are not authorized to update this response.",
//       });
//     }

//     const checklistQuestionIds = response.checklistId.questions.map((q) =>
//       q._id.toString()
//     );
//     for (const answer of answers) {
//       if (!checklistQuestionIds.includes(answer.questionId)) {
//         return res.status(400).json({
//           message: `Invalid questionId: ${answer.questionId} does not match the checklist questions.`,
//         });
//       }
//     }

//     response.answers = answers;
//     await response.save();

//     res.status(200).json({
//       message: "Driver response updated successfully.",
//       response,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Error updating driver response.",
//       error: error.message,
//     });
//   }
// };
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
      .populate("checklistId", "title category branch")
      .sort({ createdAt: -1 }); // Sorting by createdAt in descending order (newest first)

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
      .populate("driverId", "firstname lastname username role")
      .sort({ createdAt: -1 }); // Sorting by createdAt in descending order (newest first)

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
