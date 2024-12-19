const express = require("express");
const {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
} = require("../controllers/Car.controller");

const router = express.Router();

// Use controller methods
router.post("/create", createCar);
router.get("/get_all", getAllCars);
router.get("/getby_id:id", getCarById);
router.put("/update:id", updateCar);
router.delete("/delete:id", deleteCar);

module.exports = router;
