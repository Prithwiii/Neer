import express from "express";
import protect from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import {
  createProposal,
  getProposals,
  voteOnProposal,
} from "../controller/proposalController.js";

const router = express.Router();

router.post("/", protect, requireRole("committee"), createProposal);
router.get("/", protect, getProposals);
router.post("/:id/vote", protect, voteOnProposal);

export default router;