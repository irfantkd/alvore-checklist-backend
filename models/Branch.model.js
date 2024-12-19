const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    branchCode: {
      type: String,
      required: [true, "Branch code is required"],
      unique: true,
      trim: true,
    },
    branchName: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
    },
    branchAddress: {
      type: String,
      required: [true, "Branch address is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    branchDetails: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const BranchModel = mongoose.model("Branch", branchSchema);

module.exports = BranchModel;
