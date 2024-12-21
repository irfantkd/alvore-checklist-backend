const express = require("express");
const {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
} = require("../controllers/Route.controller");
const AuthCheck = require("../middlewares/Auth.middleware");

const router = express.Router();

// Protect the routes with AuthCheck middleware
router.post("/create", AuthCheck, createRoute);
router.get("/get_all", AuthCheck, getAllRoutes);
router.get("/getby_id/:id", AuthCheck, getRouteById);
router.put("/update/:id", AuthCheck, updateRoute);
router.delete("/delete/:id", AuthCheck, deleteRoute);

module.exports = router;
