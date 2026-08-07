import express from "express";
import Proposal from "../models/proposal.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Create proposal
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, type } = req.body;

    const proposal = await Proposal.create({
      title,
      description,
      type,
      createdBy: req.user._id,
    });

    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get proposals
router.get("/", protect, async (req, res) => {
  try {
    const proposals = await Proposal.find()
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Vote
router.post("/:id/vote", protect, async (req, res) => {
  try {
    const { vote } = req.body;

    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({
        message: "Proposal not found",
      });
    }

    const alreadyVoted = proposal.votes.some(
      (v) => v.resident.toString() === req.user._id.toString()
    );

    if (alreadyVoted) {
      return res.status(400).json({
        message: "You have already voted",
      });
    }

    proposal.votes.push({
      resident: req.user._id,
      vote,
    });

    await proposal.save();

    res.json(proposal);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;