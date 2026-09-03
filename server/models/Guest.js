import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
    {
        residentName: {
            type: String,
            required: true,
            trim: true
        },

        flatNumber: {
            type: String,
            required: true,
            trim: true
        },

        visitDate: {
            type: Date,
            required: true
        },

        guestName: {
            type: String,
            required: true,
            trim: true
        },

        guestPhone: {
            type: String,
            required: true,
            trim: true
        },

        passcodeHash: {
            type: String,
            required: true
        },

        checkedIn: {
            type: Boolean,
            default: false
        },

        checkedInAt: {
            type: Date,
            default: null
        },

        registeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Guest", guestSchema);