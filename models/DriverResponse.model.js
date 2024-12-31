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
        required: true, // Links the answer to a specific question in the checklist
      },
      answer: {
        type: mongoose.Schema.Types.Mixed, // Accepts multiple data types (e.g., text, image URL, dropdown selection)
        required: true,
      },
      uploadedImage: {
        type: String, // URL of the uploaded image, if applicable
      },
      comment: {
        type: String, // Additional remarks or comments, optional
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the creation date
  },
});

const DriverResponse = mongoose.model("DriverResponse", driverResponseSchema);

module.exports = DriverResponse;
