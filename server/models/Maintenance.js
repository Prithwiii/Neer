import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["Appliance", "Car", "Electronics", "Other"],
      default: "Appliance",
    },
    lastServiced: {
      type: Date,
      default: null,
    },
    // How often this item needs maintenance, in days.
    // Used to auto-calculate nextMaintenance when lastServiced changes.
    intervalDays: {
      type: Number,
      default: 90,
    },
    nextMaintenance: {
      type: Date,
      required: [true, "Next maintenance date is required"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-calculate nextMaintenance from lastServiced + intervalDays
// whenever lastServiced changes and nextMaintenance wasn't explicitly set in the same update.
maintenanceSchema.pre("save", function (next) {
  if (this.isModified("lastServiced") && !this.isModified("nextMaintenance")) {
    const base = this.lastServiced || new Date();
    const next_ = new Date(base);
    next_.setDate(next_.getDate() + this.intervalDays);
    this.nextMaintenance = next_;
  }
  next();
});

// Virtual status, derived from nextMaintenance — never stored, so it can't go stale.
maintenanceSchema.virtual("status").get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(this.nextMaintenance);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays <= 7) return "Due";
  return "Upcoming";
});

maintenanceSchema.set("toJSON", { virtuals: true });
maintenanceSchema.set("toObject", { virtuals: true });

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);

export default Maintenance;