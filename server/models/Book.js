import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        author: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        available: {
            type: Boolean,
            default: true
        },

        borrowedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        borrowedAt: {
            type: Date,
            default: null
        },

        returnDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Book = mongoose.model("Book", bookSchema);
export default Book;