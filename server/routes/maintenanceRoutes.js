import express from "express";
import {
  getMaintenanceItems,
  getReminders,
  createMaintenanceItem,
  updateMaintenanceItem,
  deleteMaintenanceItem,
} from "../controller/maintenanceController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // every route below requires a logged-in user

router.get("/", getMaintenanceItems);
router.get("/reminders", getReminders);
router.post("/", createMaintenanceItem);
router.put("/:id", updateMaintenanceItem);
router.delete("/:id", deleteMaintenanceItem);

export default router;