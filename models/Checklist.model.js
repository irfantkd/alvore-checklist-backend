const mongoose = require("mongoose");

// Checklist Schema
const checklistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title of the checklist (e.g., "Car Condition Feedback")
  },
  categories: [
    {
      type: String, // Store multiple categories as strings
      required: true,
    },
  ],
  branches: [
    {
      type: mongoose.Schema.Types.ObjectId, // Reference multiple branches
      ref: "Branch",
      required: true,
    },
  ],
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
          text: {
            type: String, // Text of the option
            required: true,
          },
          icon: {
            type: String,
            enum: ["ok", "not_ok", "warning"], // Icon for the option
            required: true,
          },
        },
      ],
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
