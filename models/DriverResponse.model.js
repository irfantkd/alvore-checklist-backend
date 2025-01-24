const mongoose = require("mongoose");

const driverResponseSchema = new mongoose.Schema({
  checklistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Checklist",
    required: true,
  },
  branches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
  ],
  units: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
    },
  ],
  routes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
    },
  ],
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      answer: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
      uploadedImages: [
        {
          type: String, // Array of image URLs
        },
      ],
      comment: {
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
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const DriverResponse = mongoose.model("DriverResponse", driverResponseSchema);
module.exports = DriverResponse;
