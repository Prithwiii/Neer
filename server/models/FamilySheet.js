import mongoose from "mongoose";

// A family expense sheet is private to the people listed on it: the owner who
// created it, plus the members the owner has given access to. Expenses live in
// their own collection and point back here through FamilyExpense.sheet.

const familySheetSchema = new mongoose.Schema(
    {
        // the family name, e.g. "Rahman Family"
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        // whoever created the sheet, they act as its admin
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // the accounts the owner has given access to, the owner is never
        // repeated in here so there is only one record of who owns the sheet
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
);

export default mongoose.model("FamilySheet", familySheetSchema);
