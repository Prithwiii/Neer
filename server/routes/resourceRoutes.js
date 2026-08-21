import express from "express";
import Resource from "../models/Resource.js";
import Booking from "../models/Booking.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all common spaces and facilities
router.get("/", protect, async (req, res) => {
  try {
    const resources = await Resource.find().sort({ category: 1, name: 1 });

    res.json(resources);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Add a new common space or facility (committee only)
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "committee") {
      return res.status(403).json({
        message: "Only committee members can add spaces or facilities",
      });
    }

    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: "Name and category are required",
      });
    }

    if (category !== "space" && category !== "facility") {
      return res.status(400).json({
        message: "Category must be either 'space' or 'facility'",
      });
    }

    const resource = await Resource.create({
      name,
      category,
      description,
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Edit a common space or facility (committee only)
router.put("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "committee") {
      return res.status(403).json({
        message: "Only committee members can edit spaces or facilities",
      });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        message: "Space or facility not found",
      });
    }

    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: "Name and category are required",
      });
    }

    if (category !== "space" && category !== "facility") {
      return res.status(400).json({
        message: "Category must be either 'space' or 'facility'",
      });
    }

    resource.name = name;
    resource.category = category;
    resource.description = description || "";
    await resource.save();

    res.json(resource);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Delete a common space or facility (committee only)
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "committee") {
      return res.status(403).json({
        message: "Only committee members can delete spaces or facilities",
      });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        message: "Space or facility not found",
      });
    }

    // cancel any active bookings on this resource before removing it
    await Booking.updateMany(
      { resource: resource._id, status: "confirmed" },
      { status: "cancelled" }
    );

    await resource.deleteOne();

    res.json({ message: "Space or facility deleted" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
