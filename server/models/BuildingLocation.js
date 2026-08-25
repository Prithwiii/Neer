import mongoose from "mongoose";

// building levels, ordered from the bottom of the building to the top
export const BUILDING_FLOORS = [
    "B1",
    "G",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "R"
];

export const LOCATION_CATEGORIES = [
    "Flat",
    "Entrance",
    "Exit",
    "Emergency Exit",
    "Elevator",
    "Staircase",
    "Facility",
    "Parking",
    "Security",
    "Other"
];

const buildingLocationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        // level key: "B1" (basement), "G" (ground), "1".."11", "R" (rooftop)
        floor: {
            type: String,
            enum: BUILDING_FLOORS,
            required: true
        },

        category: {
            type: String,
            enum: LOCATION_CATEGORIES,
            required: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        // centre of the marker on the floor plan, stored as a percentage of the
        // plan's width and height so the position stays the same on any screen
        x: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        y: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        // marker size, also a percentage of the plan's width and height
        width: {
            type: Number,
            default: 16,
            min: 2,
            max: 100
        },

        height: {
            type: Number,
            default: 10,
            min: 2,
            max: 100
        },

        // free text, e.g. "6:00 AM - 10:00 PM"
        openingHours: {
            type: String,
            default: "",
            trim: true
        },

        // residents allocated to this flat, only used when category is "Flat"
        residents: [
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

export default mongoose.model("BuildingLocation", buildingLocationSchema);
