import Alert from "../models/Alert.js";

const CAN_SEND_ROLES = ["committee", "staff"];

// GET /api/alerts
// Any logged-in user can view alerts.
export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error("getAlerts error:", err);
    res.status(500).json({ message: "Failed to fetch alerts." });
  }
};

// POST /api/alerts
// Committee/staff only. Creates a manual alert and broadcasts it.
export const createAlert = async (req, res) => {
  try {
    if (!CAN_SEND_ROLES.includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized to send alerts." });
    }

    const { title, message, severity } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required." });
    }

    const alert = await Alert.create({
      title,
      message,
      severity: severity || "info",
      type: "manual",
      source: "manual",
      createdBy: req.user._id,
      active: true,
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("newAlert", alert);
    }

    res.status(201).json(alert);
  } catch (err) {
    console.error("createAlert error:", err);
    res.status(500).json({ message: "Failed to create alert." });
  }
};

// PATCH /api/alerts/:id/deactivate
// Committee/staff only. Marks an alert inactive and notifies clients.
export const deactivateAlert = async (req, res) => {
  try {
    if (!CAN_SEND_ROLES.includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized to deactivate alerts." });
    }

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found." });
    }

    alert.active = false;
    await alert.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("alertDeactivated", alert._id);
    }

    res.json(alert);
  } catch (err) {
    console.error("deactivateAlert error:", err);
    res.status(500).json({ message: "Failed to deactivate alert." });
  }
};