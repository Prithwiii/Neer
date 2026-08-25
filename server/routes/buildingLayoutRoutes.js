import express from "express";
import mongoose from "mongoose";
import BuildingLocation, {
  BUILDING_FLOORS,
  LOCATION_CATEGORIES,
} from "../models/BuildingLocation.js";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// committee members act as the admins for the building layout, matching the
// noticeboard and space/facility features
const requireCommittee = (req, res, message) => {
  if (req.user.role !== "committee") {
    res.status(403).json({ message });
    return false;
  }

  return true;
};

const inRange = (value, min) =>
  Number.isFinite(value) && value >= min && value <= 100;

// percentages are kept to one decimal so positions stay tidy in the database
const round1 = (value) => Math.round(value * 10) / 10;

// validates and cleans up the fields shared by create and edit
const readLocationInput = (body) => {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const openingHours =
    typeof body.openingHours === "string" ? body.openingHours.trim() : "";

  const x = Number(body.x);
  const y = Number(body.y);
  const width = body.width === undefined ? 16 : Number(body.width);
  const height = body.height === undefined ? 10 : Number(body.height);

  if (!name) {
    return { error: "Name is required" };
  }

  if (name.length > 60) {
    return { error: "Name must be 60 characters or less" };
  }

  if (!BUILDING_FLOORS.includes(body.floor)) {
    return { error: "A valid floor is required" };
  }

  if (!LOCATION_CATEGORIES.includes(body.category)) {
    return { error: "A valid category is required" };
  }

  if (description.length > 300) {
    return { error: "Description must be 300 characters or less" };
  }

  if (openingHours.length > 60) {
    return { error: "Opening hours must be 60 characters or less" };
  }

  if (!inRange(x, 0) || !inRange(y, 0)) {
    return { error: "Position must be between 0 and 100" };
  }

  if (!inRange(width, 2) || !inRange(height, 2)) {
    return { error: "Size must be between 2 and 100" };
  }

  return {
    values: {
      name,
      floor: body.floor,
      category: body.category,
      description,
      openingHours,
      x: round1(x),
      y: round1(y),
      width: round1(width),
      height: round1(height),
    },
  };
};

// only flats hold residents, and only real resident accounts can be allocated
const readResidents = async (body, category) => {
  if (category !== "Flat") {
    return { values: [] };
  }

  const ids = Array.isArray(body.residents) ? body.residents : [];
  const uniqueIds = [...new Set(ids.map((id) => String(id)))];

  if (uniqueIds.length === 0) {
    return { values: [] };
  }

  if (uniqueIds.length > 10) {
    return { error: "A flat can hold at most 10 residents" };
  }

  const validIds = uniqueIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  const residents = await User.find({
    _id: { $in: validIds },
    role: "resident",
  }).select("_id");

  if (residents.length !== uniqueIds.length) {
    return {
      error: "One or more selected residents are not valid resident accounts",
    };
  }

  return { values: residents.map((resident) => resident._id) };
};

// Get the building layout, optionally limited to a single floor
router.get("/", protect, async (req, res) => {
  try {
    const filter = {};
    const { floor } = req.query;

    if (floor) {
      if (!BUILDING_FLOORS.includes(floor)) {
        return res.status(400).json({
          message: "A valid floor is required",
        });
      }

      filter.floor = floor;
    }

    // only the resident's username is exposed, never their email
    const locations = await BuildingLocation.find(filter)
      .populate("residents", "username")
      .sort({ floor: 1, category: 1, name: 1 });

    res.json(locations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get the resident accounts that can be allocated to a flat (committee only)
router.get("/residents", protect, async (req, res) => {
  try {
    if (
      !requireCommittee(
        req,
        res,
        "Only committee members can view the resident list"
      )
    ) {
      return;
    }

    const residents = await User.find({ role: "resident" })
      .select("username email")
      .sort({ username: 1 });

    res.json(residents);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Add a location to the building layout (committee only)
router.post("/", protect, async (req, res) => {
  try {
    if (
      !requireCommittee(
        req,
        res,
        "Only committee members can add building locations"
      )
    ) {
      return;
    }

    const { error, values } = readLocationInput(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const residents = await readResidents(req.body, values.category);

    if (residents.error) {
      return res.status(400).json({ message: residents.error });
    }

    const location = await BuildingLocation.create({
      ...values,
      residents: residents.values,
    });

    await location.populate("residents", "username");

    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Edit a location (committee only)
router.put("/:id", protect, async (req, res) => {
  try {
    if (
      !requireCommittee(
        req,
        res,
        "Only committee members can edit building locations"
      )
    ) {
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    const location = await BuildingLocation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    const { error, values } = readLocationInput(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const residents = await readResidents(req.body, values.category);

    if (residents.error) {
      return res.status(400).json({ message: residents.error });
    }

    location.set({ ...values, residents: residents.values });
    await location.save();

    await location.populate("residents", "username");

    res.json(location);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Move a marker to a new spot on the floor plan (committee only)
router.put("/:id/position", protect, async (req, res) => {
  try {
    if (
      !requireCommittee(
        req,
        res,
        "Only committee members can move building locations"
      )
    ) {
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    const location = await BuildingLocation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    const x = Number(req.body.x);
    const y = Number(req.body.y);

    if (!inRange(x, 0) || !inRange(y, 0)) {
      return res.status(400).json({
        message: "Position must be between 0 and 100",
      });
    }

    location.x = round1(x);
    location.y = round1(y);
    await location.save();

    await location.populate("residents", "username");

    res.json(location);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Delete a location (committee only)
router.delete("/:id", protect, async (req, res) => {
  try {
    if (
      !requireCommittee(
        req,
        res,
        "Only committee members can delete building locations"
      )
    ) {
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    const location = await BuildingLocation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    await location.deleteOne();

    res.json({ message: "Location deleted" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
