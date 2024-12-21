const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const UserRouts = require("./routes/User.routes");
const CarRouts = require("./routes/Car.routes");
const BranchRouts = require("./routes/Branch.routes");
const RouteRouts = require("./routes/Route.routes");

const port = 3003; // Define the port

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use("/auth", UserRouts);
app.use("/car", CarRouts);
app.use("/branch", BranchRouts);
app.use("/route", RouteRouts);

// Database connection
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Export the app for Vercel
module.exports = app;
