import express from "express";

import protect from "../middleware/authMiddleware.js";
import Contact from "../models/Contact.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ category: 1, name: 1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load contact directory",
      error: error.message,
    });
  }
});

router.get("/:category", protect, async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    const validCategories = ["emergency", "staff", "committee"];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid contact category" });
    }

    const contacts = await Contact.find({ category }).sort({ name: 1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load contact list",
      error: error.message,
    });
  }
});

export default router;
