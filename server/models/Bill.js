import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        amount: {
            type: Number,
            required: true
        },

        category: {
            type: String,
            enum: [
                "Electricity",
                "Gas",
                "Water",
                "Internet",
                "Maintenance Fee",
                "Security Fee",
                "Other"
            ],
            default: "Other"
        },

        // stored as "YYYY-MM-DD"
        dueDate: {
            type: String,
            required: true
        },

        // stored as "YYYY-MM", used to filter bills by month
        month: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["paid", "pending", "overdue"],
            default: "pending"
        },

        // stored as "YYYY-MM-DD", set when the bill is marked paid
        paidDate: {
            type: String,
            default: null
        },

        note: {
            type: String,
            default: "",
            trim: true
        },

        // if true, this bill is copied forward into the next month automatically
        recurring: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Bill", billSchema);
