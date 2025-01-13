// Updated Checklist Schema
const mongoose = require("mongoose");

const checklistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
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
        required: true,
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
      uploadedImages: [
        {
          type: String, // Array of image URLs
        },
      ],
      instruction: {
        type: String,
      },
      choices: [
        {
          text: {
            type: String,
            required: true,
          },
          icon: {
            type: String,
            enum: ["ok", "not_ok", "warning"],
            required: true,
          },
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
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ChecklistModel = mongoose.model("Checklist", checklistSchema);
module.exports = ChecklistModel;
