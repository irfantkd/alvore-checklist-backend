const mongoose = require("mongoose");

const insuranceCompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Insurance company name is required"],
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const InsuranceCompanyModel = mongoose.model("InsuranceCompany", insuranceCompanySchema);

module.exports = InsuranceCompanyModel; 