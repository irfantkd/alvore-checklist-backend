const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    unitNumber: {
      type: String,
      required: [true, "Unit Number is required"],
      trim: true,
    },
    plate: {
      type: String,
      required: [true, "Plate Number is required"],
      unique: true,
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
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
      required: [true, "Insurance upload is required"],
    },
    insuranceCompany: {
      type: String,
      required: [true, "Insurance Company is required"],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      trim: true,
    },
    vehicleCardUpload: {
      type: String,
      required: [true, "Vehicle Card upload is required"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Car", carSchema);
