const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "First Name is required"],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "Last Name is required"],
      trim: true,
    },
    profileimage: {
      type: String,
      default: "", // Optional: provide a default value if the image is not provided
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v); // Email validation regex
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    licensenumber: {
      type: String,
      default: "", // Optional
    },
    licenseimage: {
      type: String,
      default: "", // Optional
    },
    licenseExpirationDate: {
      type: Date, // Changed to `Date` type for proper handling of dates
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Prevent password from being returned in queries
    },
    role: {
      type: String,
      enum: ["customer", "admin"], // Role-based access
      default: "customer",
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\+?[1-9]\d{1,14}$/.test(v); // Validate international phone numbers
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Indexing email for faster searches (optional but recommended)

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
