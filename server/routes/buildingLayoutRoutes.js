import express from "express";
import mongoose from "mongoose";
import BuildingLocation, {
  BUILDING_FLOORS,
  LOCATION_CATEGORIES,
} from "../models/BuildingLocation.js";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

// committee members act as the admins for the building layout, matching the
// noticeboard and space/facility features
const committeeOnly = [protect, requireRole("committee")];

const FLAT_NUMBER_PATTERN = /^\d+-[A-Z]$/;

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
  const flatNumber =
    typeof body.flatNumber === "string"
      ? body.flatNumber.trim().toUpperCase()
      : "";

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

  if (flatNumber && !FLAT_NUMBER_PATTERN.test(flatNumber)) {
    return { error: "Flat number must use the format 10-A" };
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
      // a flat number only means something on a flat
      flatNumber: body.category === "Flat" ? flatNumber : "",
      x: round1(x),
      y: round1(y),
      width: round1(width),
      height: round1(height),
    },
  };
};

// Looks up who lives in each flat. Residents are read from User.flatNumber so
// there is only ever one record of who lives where.
const withResidents = async (locations) => {
  const flatNumbers = locations
    .filter((item) => item.category === "Flat" && item.flatNumber)
    .map((item) => item.flatNumber);

  if (flatNumbers.length === 0) {
    return locations.map((item) => ({ ...item, residents: [] }));
  }

  // only the username is exposed here, never the email
  const users = await User.find({
    flatNumber: { $in: flatNumbers },
    role: { $ne: "staff" },
  })
    .select("username flatNumber")
    .sort({ username: 1 });

  const byFlat = new Map();
  for (const user of users) {
    const list = byFlat.get(user.flatNumber) || [];
    list.push({ _id: user._id, username: user.username });
    byFlat.set(user.flatNumber, list);
  }

  return locations.map((item) => ({
    ...item,
    residents: byFlat.get(item.flatNumber) || [],
  }));
};

const sendLocation = async (res, location, status = 200) => {
  const [withPeople] = await withResidents([location.toObject()]);
  res.status(status).json(withPeople);
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

    const locations = await BuildingLocation.find(filter)
      .sort({ floor: 1, category: 1, name: 1 })
      .lean();

    res.json(await withResidents(locations));
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get the accounts a committee member can move into a flat (committee only)
router.get("/residents", committeeOnly, async (req, res) => {
  try {
    const residents = await User.find({ role: { $ne: "staff" } })
      .select("username email flatNumber")
      .sort({ username: 1 });

    res.json(residents);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Add a location to the building layout (committee only)
router.post("/", committeeOnly, async (req, res) => {
  try {
    const { error, values } = readLocationInput(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const location = await BuildingLocation.create(values);

    await sendLocation(res, location, 201);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Edit a location (committee only)
router.put("/:id", committeeOnly, async (req, res) => {
  try {
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

    location.set(values);
    await location.save();

    await sendLocation(res, location);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Move a marker to a new spot on the floor plan (committee only)
router.put("/:id/position", committeeOnly, async (req, res) => {
  try {
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

    await sendLocation(res, location);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Move residents into this flat by updating their flat number (committee only)
router.put("/:id/residents", committeeOnly, async (req, res) => {
  try {
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

    if (location.category !== "Flat") {
      return res.status(400).json({
        message: "Only flats can have residents",
      });
    }

    if (!location.flatNumber) {
      return res.status(400).json({
        message: "Give this flat a flat number before allocating residents",
      });
    }

    const ids = Array.isArray(req.body.residents) ? req.body.residents : [];
    const uniqueIds = [...new Set(ids.map((id) => String(id)))];

    if (uniqueIds.length === 0) {
      return res.status(400).json({
        message: "Select at least one resident to allocate",
      });
    }

    if (uniqueIds.length > 10) {
      return res.status(400).json({
        message: "A flat can hold at most 10 residents",
      });
    }

    const validIds = uniqueIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const users = await User.find({
      _id: { $in: validIds },
      role: { $ne: "staff" },
    });

    if (users.length !== uniqueIds.length) {
      return res.status(400).json({
        message: "One or more selected residents are not valid accounts",
      });
    }

    for (const user of users) {
      user.flatNumber = location.flatNumber;
      await user.save();
    }

    await sendLocation(res, location);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Delete a location (committee only)
router.delete("/:id", committeeOnly, async (req, res) => {
  try {
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
