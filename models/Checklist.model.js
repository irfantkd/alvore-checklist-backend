const mongoose = require("mongoose");

// Checklist Schema
const checklistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title of the checklist (e.g., "Car Condition Feedback")
  },
  category: {
    type: String,
    required: true, // Specify the category (e.g., "Unit Category")
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch", // References the Branch model
    required: true, // Checklist must belong to a branch
  },
  questions: [
    {
      label: {
        type: String,
        required: true, // The question text
      },
      answerType: {
        type: String,
        enum: [
          "text",
          "dropdown",
          "image",
          "mcqs",
          "date",
          "signature",
          "takepicture",
          "uploadimageslect",
        ],
        required: true,
      },
      instruction: {
        type: String,
      },
      choices: [
        {
          type: String, // Dropdown or multiple-choice options
        },
      ],
      isRequired: {
        type: Boolean,
        default: false,
      },
      icon: {
        type: String,
        enum: ["ok", "not_ok", "warning"], // Restrict icon types
        required: true,
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References the User model (Admin)
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ChecklistModel = mongoose.model("Checklist", checklistSchema);

module.exports = ChecklistModel;
