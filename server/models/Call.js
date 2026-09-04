import mongoose from "mongoose";


const callSchema = new mongoose.Schema(
    {
        caller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        reciever: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        roomName: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: [
                "ringing",
                "accepted",
                "rejected",
                "ended",
                "missed",
            ],
            default: "ringing",
        },
        startedAt: {
            type: Date,
        },
        endedAt: {
            type: Date,
        },
    },
    {timestamps: true,}
);

export default mongoose.model("Call", callSchema);