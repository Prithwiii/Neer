import Maintenance from "../models/Maintenance.js";

// @desc    Get all maintenance items for the logged-in user
// @route   GET /api/maintenance
export const getMaintenanceItems = async (req, res) => {
  try {
    const items = await Maintenance.find({ user: req.user._id }).sort({
      nextMaintenance: 1,
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch maintenance items", error: error.message });
  }
};

// @desc    Get only items that are Due or Overdue (for reminder banners/notifications)
// @route   GET /api/maintenance/reminders
export const getReminders = async (req, res) => {
  try {
    const items = await Maintenance.find({ user: req.user._id });
    const reminders = items.filter((item) => item.status !== "Upcoming");
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reminders", error: error.message });
  }
};

// @desc    Create a new maintenance item
// @route   POST /api/maintenance
export const createMaintenanceItem = async (req, res) => {
  try {
    const { itemName, category, lastServiced, intervalDays, notes } = req.body;
    if (!itemName) {
      return res.status(400).json({ message: "Item name is required" });
    }
    const item = await Maintenance.create({
      user: req.user._id,
      itemName,
      category,
      lastServiced,
      intervalDays,
      notes,
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to create maintenance item", error: error.message });
  }
};

// @desc    Update a maintenance item (e.g. mark as serviced today)
// @route   PUT /api/maintenance/:id
export const updateMaintenanceItem = async (req, res) => {
  try {
    const item = await Maintenance.findOne({ _id: req.params.id, user: req.user._id });

    if (!item) {
      return res.status(404).json({ message: "Maintenance item not found" });
    }

    Object.assign(item, req.body);
    await item.save();

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update maintenance item", error: error.message });
  }
};

// @desc    Delete a maintenance item
// @route   DELETE /api/maintenance/:id
export const deleteMaintenanceItem = async (req, res) => {
  try {
    const item = await Maintenance.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!item) {
      return res.status(404).json({ message: "Maintenance item not found" });
    }

    res.status(200).json({ message: "Maintenance item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete maintenance item", error: error.message });
  }
};