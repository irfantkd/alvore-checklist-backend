"use strict";

const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const crypto = require("crypto");

// Import routes
const UserRoutes = require("./routes/User.routes");
const CarRoutes = require("./routes/Car.routes");
const BranchRoutes = require("./routes/Branch.routes");
const RouteRoutes = require("./routes/Route.routes");

// Middlewares
app.use(express.json()); // For parsing JSON requests
app.use(cors()); // For handling Cross-Origin requests

const secret = crypto.randomBytes(32).toString("hex");
app.use(
  session({
    secret: secret || "your-secret-key",
    resave: false, // Prevent resaving sessions if unchanged
    saveUninitialized: false, // Don't save empty sessions
    cookie: {
      httpOnly: true,
      secure: false, // Change to true if using HTTPS
      maxAge: 30 * 60 * 1000, // Session expiration: 30 minutes
    },
  })
);

// Define a test route
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// Use routes
app.use("/auth", UserRoutes);
app.use("/car", CarRoutes);
app.use("/branch", BranchRoutes);
app.use("/route", RouteRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Export the app for deployment (e.g., Vercel)
module.exports = app;
