import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getGarageBookings,
  getMyGarageBookings,
  createGarageBooking,
  cancelGarageBooking,
} from "../controller/garageBookingController.js";

const router = express.Router();

router.get("/", protect, getGarageBookings);
router.get("/mine", protect, getMyGarageBookings);
router.post("/", protect, createGarageBooking);
router.post("/:id/cancel", protect, cancelGarageBooking);

export default router;
