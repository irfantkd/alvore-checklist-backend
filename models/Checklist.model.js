const mongoose = require("mongoose");

const checklistSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleCategory"
    },
  ],
  branches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
  ],
  questions: [
    {
      label: {
        type: String,
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
      },
      instruction: {
        type: String,
      },
      choices: [
        {
          text: {
            type: String,
          },
          icon: {
            type: String,
            enum: ["ok", "not_ok", "warning", "na"],
            required: true,
          },
        },
      ],
      isRequired: {
        type: Boolean,
      },
    },
  ],
  uploadedImages: [
    {
      questionId: {
        type: Number, // Index or identifier to link with questions
        required: true,
      },
      imageUrls: [
        {
          type: String,
        },
      ],
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ChecklistModel = mongoose.model("Checklist", checklistSchema);
module.exports = ChecklistModel;
