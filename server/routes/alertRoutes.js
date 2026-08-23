import express from "express";
import { getAlerts, createAlert } from "../controller/alertController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAlerts);
router.post("/", createAlert); // role check happens inside the controller

export default router;
