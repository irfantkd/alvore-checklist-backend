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
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9_.-]{3,20}$/.test(v); // Username validation regex
        },
        message: (props) => `${props.value} is not a valid username!`,
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
      unique: true,

      required: [true, "Phone Number is required"],
      validate: {
        validator: function (v) {
          return /^\+?[1-9]\d{1,14}$/.test(v); // Validate international phone numbers
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    otp: {
      type: String, // OTP field
      select: false, // Prevent OTP from being returned in queries
    },
    otpExpiry: {
      type: Date, // OTP expiration time
      select: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
