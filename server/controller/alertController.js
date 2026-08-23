import Alert from "../models/Alert.js";

const ALLOWED_SENDER_ROLES = ["staff", "committee"];

// @desc    Get recent emergency alerts (any logged-in resident can view)
// @route   GET /api/alerts
export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch alerts", error: error.message });
  }
};

// @desc    Send a new emergency alert (staff/committee only)
// @route   POST /api/alerts
export const createAlert = async (req, res) => {
  try {
    if (!ALLOWED_SENDER_ROLES.includes(req.user.role)) {
      return res.status(403).json({
        message: "Only staff or committee members can send emergency alerts",
      });
    }

    const { message, severity } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Alert message is required" });
    }

    const alert = await Alert.create({
      sender: req.user._id,
      senderName: req.user.username,
      message: message.trim(),
      severity: severity || "Critical",
    });

    // Broadcast in real time to every connected client, reusing the
    // same Socket.io server the chat feature set up.
    const io = req.app.get("io");
    if (io) {
      io.emit("newAlert", alert);
    }

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: "Failed to send alert", error: error.message });
  }
};
