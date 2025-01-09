// const mongoose = require("mongoose");

// const driverResponseSchema = new mongoose.Schema({
//   checklistId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Checklist",
//     required: true, // Links the response to a specific checklist
//   },
//   driverId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User", // Links the response to a specific driver
//     required: true,
//   },
//   answers: [
//     {
//       questionId: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true, // Links the answer to a specific question in the checklist
//       },
//       answer: {
//         type: mongoose.Schema.Types.Mixed, // Accepts multiple data types (e.g., text, image URL, dropdown selection)
//         required: true,
//       },
//       uploadedImage: {
//         type: String, // URL of the uploaded image, if applicable
//       },
//       comment: {
//         type: String, // Additional remarks or comments, optional
//       },
//       icon: {
//         type: String,
//         enum: ["ok", "not_ok", "warning"],
//         required: true,
//       },
//     },
//   ],
//   createdAt: {
//     type: Date,
//     default: Date.now, // Automatically sets the creation date
//   },
// });

// const DriverResponse = mongoose.model("DriverResponse", driverResponseSchema);

// module.exports = DriverResponse;

const mongoose = require("mongoose");

const driverResponseSchema = new mongoose.Schema({
  checklistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Checklist",
    required: true,
  },
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
