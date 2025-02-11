const express = require("express");
const {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
} = require("../controllers/Car.controller");
const AuthCheck = require("../middlewares/Auth.middleware");
const { upload } = require("../utils/sirvUploader");

// Define upload fields
const uploadFields = upload.fields([
  { name: "vehicleCardUpload", maxCount: 1 },
  { name: "insuranceUpload", maxCount: 1 },
]);

const router = express.Router();

// Protected routes with file upload handling
router.post("/create", uploadFields, AuthCheck, createCar);
router.get("/get_all", AuthCheck, getAllCars);
router.get("/getby_id/:id", AuthCheck, getCarById);
router.put("/update/:id", uploadFields, AuthCheck, updateCar);
router.delete("/delete/:id", AuthCheck, deleteCar);

module.exports = router;
