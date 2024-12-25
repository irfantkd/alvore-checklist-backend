const mongoose = require("mongoose");

const driverResponseSchema = new mongoose.Schema({
  checklistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Checklist",
    required: true, // Links the response to a specific checklist
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links the response to a specific driver
    required: true,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true, // Links the answer to a specific question
      },
      answer: {
        type: mongoose.Schema.Types.Mixed, // Can be text, image URL, etc.
      },
      uploadedImage: {
        type: String, // URL of the uploaded image (if applicable)
      },
      comment: {
        type: String, // Additional remarks or comments
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const DriverResponse = mongoose.model("DriverResponse", driverResponseSchema);

module.exports = DriverResponse;
