console.log("seeding default spaces and facilities");

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import Resource from "./models/Resource.js";

const defaultResources = [
    { name: "Community Room", category: "space", description: "Shared indoor space for gatherings and events" },
    { name: "Rooftop", category: "space", description: "Open-air rooftop area" },
    { name: "BBQ Area", category: "space", description: "Outdoor barbecue and grilling area" },
    { name: "Meeting Room", category: "space", description: "Small room for meetings" },
    { name: "Gym", category: "facility", description: "Fitness center" },
    { name: "Swimming Pool", category: "facility", description: "Community swimming pool" },
];

const run = async () => {

    await connectDB();

    for (const item of defaultResources) {

        const exists = await Resource.findOne({ name: item.name });

        if (!exists) {
            await Resource.create(item);
            console.log(`Added: ${item.name}`);
        } else {
            console.log(`Already exists: ${item.name}`);
        }
    }

    console.log("Seeding done.");
    process.exit(0);
};

run();
