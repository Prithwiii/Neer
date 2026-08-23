import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Denormalized so the frontend doesn't need a lookup per alert.
    senderName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: [true, "Alert message is required"],
      trim: true,
      maxlength: 500,
    },
    severity: {
      type: String,
      enum: ["Critical", "Warning", "Info"],
      default: "Critical",
    },
  },
  { timestamps: true }
);

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
