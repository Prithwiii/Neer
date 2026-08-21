import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    }
,
    role: {
        type: String,
        enum: ["staff", "resident", "committee"],
        default: "resident"
    },

    flatNumber: {
        type: String,
        trim: true,
        uppercase: true,
        required: function () {
            return this.role !== "staff";
        },
        match: [/^\d+-[A-Z]$/, "Flat number must use the format 10-A"]
    }
},
{
    timestamps: true
});

export default mongoose.model("User", userSchema)