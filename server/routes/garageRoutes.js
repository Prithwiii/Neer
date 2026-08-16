import express from "express";
import Garage from "../models/Garage.js";
import GarageBooking from "../models/GarageBooking.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// List garages, with optional ?status=available|unavailable to filter by current booking state
router.get("/", protect, async (req, res) => {
  try {
    const { availableOnly, status } = req.query;

    const garages = await Garage.find().sort({ name: 1 });

    const now = new Date();

    const result = await Promise.all(
      garages.map(async (g) => {
        const overlapping = await GarageBooking.find({
          garage: g._id,
          status: "confirmed",
          startDate: { $lte: now },
          endDate: { $gt: now },
        }).sort({ endDate: 1 });

        let isFree = overlapping.length === 0;
        let nextRelease = null;
        if (!isFree) nextRelease = overlapping[0].endDate;

        return {
          _id: g._id,
          name: g.name,
          slotNumber: g.slotNumber,
          description: g.description,
          owner: g.owner || "",
          contactNo: g.contactNo || "",
          isFree,
          nextRelease,
        };
      })
    );

    let filtered = result;

    if (status === "available") {
      filtered = result.filter((r) => r.isFree);
    } else if (status === "unavailable") {
      filtered = result.filter((r) => !r.isFree);
    } else if (availableOnly === "true") {
      filtered = result.filter((r) => r.isFree);
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Committee can add garages
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "committee") {
      return res.status(403).json({ message: "Only committee members can add garages" });
    }

    const { name, slotNumber, description, owner } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const g = await Garage.create({ name, slotNumber, description, owner });

    res.status(201).json(g);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
