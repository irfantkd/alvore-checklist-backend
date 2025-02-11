const mongoose = require("mongoose");

const vehicleCategorySchema = new mongoose.Schema({
    categoryname: {
    type: String,
    required: [true, "Category name is required"],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;  // Ensure non-empty string
      },
      message: "Category name cannot be empty"
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add pre-save middleware to ensure categoryname is not null/empty
vehicleCategorySchema.pre('save', function(next) {
  if (!this.categoryname || this.categoryname.trim().length === 0) {
    next(new Error('Category name is required and cannot be empty'));
  }
  next();
});

const VehicleCategoryModel = mongoose.model("VehicleCategory", vehicleCategorySchema);
module.exports = VehicleCategoryModel; 