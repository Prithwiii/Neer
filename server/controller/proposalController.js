import Proposal from "../models/proposal.js";

const createProposal = async (req, res) => {
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
};

const getProposals = async (req, res) => {
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
};

const voteOnProposal = async (req, res) => {
  try {
    const { vote } = req.body;

    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({
        message: "Proposal not found",
      });
    }

    const existingVote = proposal.votes.find(
      (item) => item.resident.toString() === req.user._id.toString()
    );

    if (existingVote) {
      existingVote.vote = vote;
    } else {
      proposal.votes.push({ resident: req.user._id, vote });
    }

    await proposal.save();

    res.json(proposal);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { createProposal, getProposals, voteOnProposal };
