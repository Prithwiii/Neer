import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["Budget Approval", "Rule Change", "Vendor Selection"],
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    votes: [
      {
        resident: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        vote: {
          type: String,
          enum: ["Yes", "No"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Proposal", proposalSchema);