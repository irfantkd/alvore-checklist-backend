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
      default: "",
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9_.-]{3,20}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid username!`,
      },
    },
    licensenumber: {
      type: String,
      default: "",
    },
    licenseimage: {
      type: String,
      default: "",
    },
    licenseExpirationDate: {
      type: Date,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "driver"], // Added "driver" role
      default: "driver",
    },
    phone: {
      type: String,
      unique: true,
      required: [true, "Phone Number is required"],
      validate: {
        validator: function (v) {
          return /^\+?[1-9]\d{1,14}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
