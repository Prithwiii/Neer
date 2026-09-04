import mongoose from "mongoose";

const househelpPostingSchema = new mongoose.Schema(
    {
        residentName: {
            type: String,
            required: true,
            trim: true,
        },
        flatNumber: {
            type: String,
            required: true,
            trim: true,
        },
        hours: {
            type: String,
            required: true,
            trim: true,
        },
        mobileNumber: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open",
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        closedAt: {
            type: Date,
            default: null
        },
    },
    {timestamps: true,}
);

const HousehelpPosting = mongoose.model(
    "HousehelpPosting",
    househelpPostingSchema
);

export default HousehelpPosting;