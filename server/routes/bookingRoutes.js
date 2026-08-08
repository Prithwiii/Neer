import express from "express";
import Booking from "../models/Booking.js";
import Resource from "../models/Resource.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Get confirmed bookings for a resource on a date (used to show availability)
router.get("/", protect, async (req, res) => {
  try {
    const { resourceId, date } = req.query;

    if (!resourceId || !date) {
      return res.status(400).json({
        message: "resourceId and date are required",
      });
    }

    const bookings = await Booking.find({
      resource: resourceId,
      date,
      status: "confirmed",
    }).select("startTime endTime");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get the logged-in user's own bookings
router.get("/mine", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ bookedBy: req.user._id })
      .populate("resource", "name category")
      .sort({ date: -1, startTime: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Create a booking
router.post("/", protect, async (req, res) => {
  try {
    const { resourceId, date, startTime, endTime, purpose } = req.body;

    if (!resourceId || !date || !startTime || !endTime) {
      return res.status(400).json({
        message: "resourceId, date, startTime and endTime are required",
      });
    }

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        message: "Space or facility not found",
      });
    }

    if (resource.category === "space" && !purpose) {
      return res.status(400).json({
        message: "Purpose is required when booking a common space",
      });
    }

    if (endTime <= startTime) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);

    if (isNaN(startDateTime.getTime()) || startDateTime < new Date()) {
      return res.status(400).json({
        message: "Cannot book a date or time in the past",
      });
    }

    // Conflict check: any confirmed booking on the same resource/date
    // whose time range overlaps the requested range
    const overlapping = await Booking.findOne({
      resource: resourceId,
      date,
      status: "confirmed",
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (overlapping) {
      return res.status(400).json({
        message: "This time slot is already booked",
      });
    }

    const booking = await Booking.create({
      resource: resourceId,
      bookedBy: req.user._id,
      date,
      startTime,
      endTime,
      purpose: purpose || "",
    });

    await booking.populate("resource", "name category");

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Cancel a booking (only the resident who made it can cancel it)
router.post("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.bookedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only cancel your own bookings",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "This booking is already cancelled",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
