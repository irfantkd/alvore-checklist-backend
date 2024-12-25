const mongoose = require("mongoose");

// Checklist Schema
const checklistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title of the checklist (e.g., "Car Condition Feedback")
  },
  questions: [
    {
      label: {
        type: String,
        required: true, // The question text
      },
      answerType: {
        type: String,
        enum: ["text", "dropdown", "image", "number", "date", "signature"],
        required: true,
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

// Driver Response Schema

const ChecklistModel = mongoose.model("Checklist", checklistSchema);

module.exports = ChecklistModel;
