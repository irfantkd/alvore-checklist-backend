const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const UserRouts = require("./routes/User.routes");

const port = 3003;

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use("/auth", UserRouts);

mongoose
  .connect(
    "mongodb+srv://irfantkd:3Bbk1NoVRqjKDeOD@notetakeing.yze0q5w.mongodb.net/AlvoreCarDB"
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is statring on port: ${port}`);
    });
  });
