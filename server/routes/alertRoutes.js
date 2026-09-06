import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getAlerts,
  createAlert,
  deactivateAlert,
} from "../controller/alertController.js";

const router = express.Router();

router.get("/", protect, getAlerts);
router.post("/", protect, createAlert);
router.patch("/:id/deactivate", protect, deactivateAlert);

export default router;