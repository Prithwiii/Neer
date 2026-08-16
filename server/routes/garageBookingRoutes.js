import express from "express";
import Garage from "../models/Garage.js";
import GarageBooking from "../models/GarageBooking.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Get confirmed bookings for a garage (optionally overlaps with start/end query)
router.get("/", protect, async (req, res) => {
  try {
    const { garageId, start, end } = req.query;

    if (!garageId) return res.status(400).json({ message: "garageId is required" });

    const query = { garage: garageId, status: "confirmed" };

    if (start && end) {
      // return bookings that overlap the period
      query.$or = [
        { startDate: { $lt: new Date(end) }, endDate: { $gt: new Date(start) } },
      ];
    }

    const bookings = await GarageBooking.find(query).select("startDate endDate bookedBy purpose status");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's garage bookings
router.get("/mine", protect, async (req, res) => {
  try {
    const bookings = await GarageBooking.find({ bookedBy: req.user._id })
      .populate("garage", "name slotNumber")
      .sort({ startDate: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a garage booking
router.post("/", protect, async (req, res) => {
  try {
    const { garageId, startDate, endDate, purpose } = req.body;

    if (!garageId || !startDate || !endDate) {
      return res.status(400).json({ message: "garageId, startDate and endDate are required" });
    }

    const garage = await Garage.findById(garageId);
    if (!garage) return res.status(404).json({ message: "Garage not found" });

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid startDate or endDate" });
    }

    if (end <= start) return res.status(400).json({ message: "End must be after start" });

    if (end <= new Date()) return res.status(400).json({ message: "Cannot book entirely in the past" });

    // Overlap check
    const overlapping = await GarageBooking.findOne({
      garage: garageId,
      status: "confirmed",
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (overlapping) return res.status(400).json({ message: "This time range is already booked" });

    const booking = await GarageBooking.create({
      garage: garageId,
      bookedBy: req.user._id,
      startDate: start,
      endDate: end,
      purpose: purpose || "",
    });

    await booking.populate("garage", "name slotNumber");

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking
router.post("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await GarageBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.bookedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only cancel your own bookings" });
    }

    if (booking.status === "cancelled") return res.status(400).json({ message: "Already cancelled" });

    booking.status = "cancelled";
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
