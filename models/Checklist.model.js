const mongoose = require("mongoose");

const checklistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title of the checklist (e.g., "Car Condition Feedback")
  },
  questions: [
    {
      label: {
        type: String,
        required: true, // The question text (e.g., "What is the condition of the tires?")
      },
      answerType: {
        type: String,
        enum: ["text", "dropdown", "image", "number", "date", "signature"], // Types of answers
        required: true,
      },
      choices: [
        {
          type: String, // Dropdown or multiple-choice options
        },
      ],
      isRequired: {
        type: Boolean,
        default: false, // Whether this question is required
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now, // When the checklist was created
  },
});

const driverResponseSchema = new mongoose.Schema({
  checklistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Checklist",
    required: true, // Links the response to a specific checklist
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true, // Links the response to a specific driver
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true, // Links the answer to a specific question
      },
      answer: {
        type: mongoose.Schema.Types.Mixed, // Can be text, image URL, number, etc.
      },
      uploadedImage: {
        type: String, // URL of the uploaded image (if applicable)
      },
      comment: {
        type: String, // Any additional remarks or comments
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now, // When the response was submitted
  },
});

const Checklist = mongoose.model("Checklist", checklistSchema);
const DriverResponse = mongoose.model("DriverResponse", driverResponseSchema);

module.exports = { Checklist, DriverResponse };
