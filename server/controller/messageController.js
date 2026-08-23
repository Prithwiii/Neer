import Message from "../models/Message.js";

// @desc    Get recent chat history for the community room
// @route   GET /api/messages
export const getMessages = async (req, res) => {
  try {
    // Most recent 50 messages, returned oldest-first so the UI can render top-to-bottom.
    const messages = await Message.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};
