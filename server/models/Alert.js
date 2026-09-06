import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      required: true,
      default: "info",
    },
    type: {
      type: String,
      enum: ["manual", "automated"],
      required: true,
    },
    source: {
      type: String, // e.g. "usgs", "manual"
      default: "manual",
    },
    externalId: {
      type: String, // dedup key for automated alerts (e.g. USGS event id)
      index: true,
      sparse: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);