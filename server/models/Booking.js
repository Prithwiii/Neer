import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        resource: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource",
            required: true
        },

        bookedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // stored as "YYYY-MM-DD"
        date: {
            type: String,
            required: true
        },

        // stored as "HH:MM" in 24 hour format
        startTime: {
            type: String,
            required: true
        },

        // stored as "HH:MM" in 24 hour format
        endTime: {
            type: String,
            required: true
        },

        purpose: {
            type: String,
            default: "",
            trim: true
        },

        status: {
            type: String,
            enum: ["confirmed", "cancelled"],
            default: "confirmed"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Booking", bookingSchema);
