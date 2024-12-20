const express = require("express");
const {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
} = require("../controllers/Car.controller");
const AuthCheck = require("../middlewares/Auth.middleware");

const router = express.Router();

// Protect the routes with AuthCheck middleware
router.post("/create", AuthCheck, createCar);
router.get("/get_all", AuthCheck, getAllCars);
router.get("/getby_id/:id", AuthCheck, getCarById);
router.put("/update/:id", AuthCheck, updateCar);
router.delete("/delete/:id", AuthCheck, deleteCar);

module.exports = router;
