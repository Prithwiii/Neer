import express from "express";
import mongoose from "mongoose";
import Camera from "../models/Camera.js";
import { BUILDING_FLOORS } from "../models/BuildingLocation.js";
import protect from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

// committee members manage cameras, same pattern as the building layout
const committeeOnly = [protect, requireRole("committee")];

// Get all cameras, optionally limited to one floor: /api/cameras?floor=G
router.get("/", protect, async (req, res) => {
  try {
    const filter = {};
    const { floor } = req.query;

    if (floor) {
      if (!BUILDING_FLOORS.includes(floor)) {
        return res.status(400).json({ message: "A valid floor is required" });
      }
      filter.floor = floor;
    }

    const cameras = await Camera.find(filter).sort({ floor: 1, name: 1 });

    res.json(cameras);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a camera (committee only)
router.post("/", committeeOnly, async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const location =
      typeof req.body.location === "string" ? req.body.location.trim() : "";
    const streamUrl =
      typeof req.body.streamUrl === "string" ? req.body.streamUrl.trim() : "";

    if (!name) return res.status(400).json({ message: "Name is required" });

    if (!BUILDING_FLOORS.includes(req.body.floor)) {
      return res.status(400).json({ message: "A valid floor is required" });
    }

    const camera = await Camera.create({
      name,
      floor: req.body.floor,
      location,
      streamUrl,
      addedBy: req.user._id,
    });

    res.status(201).json(camera);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle a camera online/offline (committee only)
router.put("/:id/status", committeeOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Camera not found" });
    }

    if (!["online", "offline"].includes(req.body.status)) {
      return res.status(400).json({ message: "Status must be online or offline" });
    }

    const camera = await Camera.findById(req.params.id);
    if (!camera) return res.status(404).json({ message: "Camera not found" });

    camera.status = req.body.status;
    await camera.save();

    res.json(camera);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove a camera (committee only)
router.delete("/:id", committeeOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Camera not found" });
    }

    const camera = await Camera.findById(req.params.id);
    if (!camera) return res.status(404).json({ message: "Camera not found" });

    await camera.deleteOne();

    res.json({ message: "Camera deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
