const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const UserRouts = require("./routes/User.routes");

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use("/auth", UserRouts);

// Database connection and export
mongoose
  .connect(
    "mongodb+srv://alvore_fleet:7Urk182@cluster0.fvl2h.mongodb.net/alvoreDB"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Export the app for Vercel
module.exports = app;
