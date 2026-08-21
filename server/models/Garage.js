import mongoose from "mongoose";

const garageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slotNumber: { type: String, default: "" },
    description: { type: String, default: "", trim: true },
    owner: { type: String, default: "", trim: true }, // e.g., unit like '10-A'
    contactNo: { type: String, default: "", trim: true }, // e.g., '01383838383'
  },
  { timestamps: true }
);

export default mongoose.model("Garage", garageSchema);
