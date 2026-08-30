import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["emergency", "staff", "committee"],
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Contact", contactSchema);
