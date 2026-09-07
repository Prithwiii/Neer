import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getAvailableGarages,
  createGarage,
} from "../controller/garageController.js";

const router = express.Router();

router.get("/", protect, getAvailableGarages);
router.post("/", protect, createGarage);

export default router;
