import mongoose from "mongoose";

export const EXPENSE_CATEGORIES = [
    "Food",
    "Bills",
    "Transport",
    "Health",
    "Education",
    "Shopping",
    "Other"
];

const familyExpenseSchema = new mongoose.Schema(
    {
        // the sheet this expense belongs to, access is always checked against it
        sheet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FamilySheet",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        category: {
            type: String,
            enum: EXPENSE_CATEGORIES,
            default: "Other"
        },

        // stored as "YYYY-MM-DD", same as Bill.dueDate
        date: {
            type: String,
            required: true
        },

        // stored as "YYYY-MM", used to filter expenses by month like Bill.month
        month: {
            type: String,
            required: true,
            index: true
        },

        note: {
            type: String,
            default: "",
            trim: true
        },

        // the family member who entered the expense
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("FamilyExpense", familyExpenseSchema);
