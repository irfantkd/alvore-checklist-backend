const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    unitNumber: {
      type: String,
      trim: true,
    },
    plate: {
      type: String,
      unique: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"], // Ensure category is provided
      enum: ["Delivery Units", "Sales Units", "Supervision Units"], // Define allowed categories
    },
    color: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
      validate: {
        validator: function (v) {
          const currentYear = new Date().getFullYear();
          return v >= 1886 && v <= currentYear; // Cars started production in 1886
        },
        message: (props) => `${props.value} is not a valid year!`,
      },
    },
    insuranceUpload: {
      type: String,
    },
    insuranceCompany: {
      type: String,
      trim: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    vehicleCardUpload: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const CarModel = mongoose.model("Car", carSchema);

module.exports = CarModel;
