import mongoose from "mongoose";
import { BUILDING_FLOORS } from "./BuildingLocation.js";

const cameraSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Lobby Entrance"

    // level key: "B1" (basement), "G" (ground), "1".."11", "R" (rooftop)
    floor: {
      type: String,
      enum: BUILDING_FLOORS,
      required: true,
    },

    location: { type: String, default: "", trim: true }, // e.g. "Near the elevator"

    // real deployments would put an RTSP/HLS/WebRTC stream URL here; left
    // optional so the feature works with placeholder feeds until real
    // cameras are wired up
    streamUrl: { type: String, default: "", trim: true },

    status: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },

    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Camera", cameraSchema);
