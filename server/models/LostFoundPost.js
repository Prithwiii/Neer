import mongoose from "mongoose";

export const LOST_FOUND_TYPES = ["Lost", "Found"];

export const ITEM_CATEGORIES = [
    "Electronics",
    "Clothing",
    "Keys",
    "Wallet/ID",
    "Accessories",
    "Documents",
    "Other"
];

// a post stays on the board once it is resolved so residents can still look
// back at it, it is just no longer counted as active
export const POST_STATUSES = ["Active", "Returned"];

const lostFoundPostSchema = new mongoose.Schema(
    {
        // "Lost" means the poster lost it, "Found" means the poster found it
        type: {
            type: String,
            enum: LOST_FOUND_TYPES,
            required: true
        },

        itemName: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            enum: ITEM_CATEGORIES,
            default: "Other"
        },

        // stored as "YYYY-MM-DD", same as Bill.dueDate and FamilyExpense.date
        date: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        // optional photo held as a data URI. The project has no file upload or
        // static hosting, so the picture is shrunk in the browser and stored
        // with the post. It is left out of the board listing and only sent with
        // a single post, so the board stays light.
        image: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: POST_STATUSES,
            default: "Active"
        },

        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        resolvedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("LostFoundPost", lostFoundPostSchema);
