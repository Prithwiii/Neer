console.log("seeding the building layout");

// same DNS override server.js uses, the Atlas SRV lookup fails without it
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import BuildingLocation from "./models/BuildingLocation.js";

// The building is a 12 storey point tower with a basement: every residential
// floor wraps four flats around a central core holding the lifts and stairs.
// x/y are the centre of each room as a percentage of the floor plan.

const basement = [
    {
        name: "Parking Zone A",
        category: "Parking",
        description: "Reserved car parking for flats on floors 1 to 6",
        x: 26, y: 22, width: 38, height: 26
    },
    {
        name: "Parking Zone B",
        category: "Parking",
        description: "Reserved car parking for flats on floors 7 to 11",
        x: 26, y: 79, width: 38, height: 26
    },
    {
        name: "Car Ramp",
        category: "Parking",
        description: "Vehicle ramp up to the ground floor parking gate",
        x: 76, y: 22, width: 30, height: 26
    },
    {
        name: "Passenger Lift 1",
        category: "Elevator",
        description: "Serves the basement through to the rooftop",
        x: 18, y: 52, width: 12, height: 14
    },
    {
        name: "Passenger Lift 2",
        category: "Elevator",
        description: "Serves the basement through to the rooftop",
        x: 31, y: 52, width: 12, height: 14
    },
    {
        name: "Basement Staircase",
        category: "Staircase",
        description: "Stairs up to the ground floor lobby",
        x: 46, y: 52, width: 14, height: 14
    },
    {
        name: "Generator Room",
        category: "Other",
        description: "Backup generator, staff access only",
        x: 70, y: 52, width: 26, height: 14
    },
    {
        name: "Water Pump Room",
        category: "Other",
        description: "Water pumps and reserve tank, staff access only",
        x: 72, y: 79, width: 30, height: 26
    }
];

const ground = [
    {
        name: "Main Entrance",
        category: "Entrance",
        description: "Main pedestrian entrance from the street",
        openingHours: "Open 24 hours",
        x: 20, y: 11, width: 26, height: 12
    },
    {
        name: "Parking Entry Gate",
        category: "Entrance",
        description: "Vehicle gate leading down to the basement car ramp",
        openingHours: "Open 24 hours",
        x: 80, y: 11, width: 26, height: 12
    },
    {
        name: "Entrance Lobby",
        category: "Other",
        description: "Waiting area between the main entrance and the lifts",
        x: 50, y: 30, width: 30, height: 18
    },
    {
        name: "Reception & Security Desk",
        category: "Security",
        description: "Visitor sign-in, parcel collection and building security",
        openingHours: "Open 24 hours",
        x: 19, y: 32, width: 24, height: 16
    },
    {
        name: "Mail Room",
        category: "Other",
        description: "Letter boxes and parcel lockers for all flats",
        openingHours: "6:00 AM - 10:00 PM",
        x: 81, y: 32, width: 24, height: 16
    },
    {
        name: "Passenger Lift 1",
        category: "Elevator",
        description: "Serves the basement through to the rooftop",
        x: 44, y: 50, width: 12, height: 14
    },
    {
        name: "Passenger Lift 2",
        category: "Elevator",
        description: "Serves the basement through to the rooftop",
        x: 57, y: 50, width: 12, height: 14
    },
    {
        name: "Main Staircase",
        category: "Staircase",
        description: "Main stairs running the full height of the building",
        x: 25, y: 55, width: 14, height: 14
    },
    {
        name: "Fire Exit Staircase",
        category: "Emergency Exit",
        description: "Protected fire stairs, keep clear at all times",
        x: 76, y: 55, width: 14, height: 14
    },
    {
        name: "Gym",
        category: "Facility",
        description: "Fitness centre with cardio and weights area",
        openingHours: "6:00 AM - 10:00 PM",
        x: 22, y: 79, width: 30, height: 24
    },
    {
        name: "Common Room",
        category: "Facility",
        description: "Shared indoor space for gatherings and small events",
        openingHours: "8:00 AM - 11:00 PM",
        x: 78, y: 79, width: 30, height: 24
    },
    {
        name: "Emergency Exit Door",
        category: "Emergency Exit",
        description: "Fire exit door leading to the side assembly point",
        x: 50, y: 71, width: 20, height: 8
    },
    {
        name: "Rear Exit",
        category: "Exit",
        description: "Everyday exit to the rear garden and bin store",
        openingHours: "6:00 AM - 11:00 PM",
        x: 50, y: 88, width: 20, height: 8
    }
];

const rooftop = [
    {
        name: "Swimming Pool",
        category: "Facility",
        description: "Rooftop pool, children must be supervised at all times",
        openingHours: "7:00 AM - 9:00 PM",
        x: 30, y: 32, width: 42, height: 34
    },
    {
        name: "Pool Deck",
        category: "Facility",
        description: "Sun loungers and changing rooms beside the pool",
        openingHours: "7:00 AM - 9:00 PM",
        x: 77, y: 32, width: 30, height: 34
    },
    {
        name: "Passenger Lift 1",
        category: "Elevator",
        description: "Serves the basement through to the rooftop",
        x: 44, y: 68, width: 12, height: 14
    },
    {
        name: "Passenger Lift 2",
        category: "Elevator",
        description: "Serves the basement through to the rooftop",
        x: 57, y: 68, width: 12, height: 14
    },
    {
        name: "Roof Access Staircase",
        category: "Staircase",
        description: "Top of the main staircase",
        x: 22, y: 70, width: 20, height: 16
    },
    {
        name: "Fire Exit Staircase",
        category: "Emergency Exit",
        description: "Protected fire stairs down to the ground floor exit",
        x: 79, y: 70, width: 20, height: 16
    },
    {
        name: "Water Tank",
        category: "Other",
        description: "Overhead water tanks, staff access only",
        x: 25, y: 90, width: 26, height: 12
    },
    {
        name: "Community Terrace",
        category: "Facility",
        description: "Open-air terrace and BBQ area for residents",
        openingHours: "6:00 AM - 11:00 PM",
        x: 68, y: 90, width: 34, height: 12
    }
];

// every residential floor shares the same central core plan
const residentialFloor = (floor) => [
    {
        name: `Flat ${floor}A`,
        category: "Flat",
        flatNumber: `${floor}-A`,
        state: "For Sale",
        description: "Corner flat on the north-west side",
        x: 21, y: 26, width: 28, height: 34
    },
    {
        name: `Flat ${floor}B`,
        category: "Flat",
        flatNumber: `${floor}-B`,
        state: "For Sale",
        description: "Corner flat on the north-east side",
        x: 79, y: 26, width: 28, height: 34
    },
    {
        name: `Flat ${floor}C`,
        category: "Flat",
        flatNumber: `${floor}-C`,
        state: "For Sale",
        description: "Corner flat on the south-east side",
        x: 79, y: 74, width: 28, height: 34
    },
    {
        name: `Flat ${floor}D`,
        category: "Flat",
        flatNumber: `${floor}-D`,
        state: "For Sale",
        description: "Corner flat on the south-west side",
        x: 21, y: 74, width: 28, height: 34
    },
    {
        name: "Passenger Lift 1",
        category: "Elevator",
        description: "Serves the basement through to the rooftop",
        x: 44, y: 28, width: 12, height: 14
    },
    {
        name: "Passenger Lift 2",
        category: "Elevator",
        description: "Serves the basement through to the rooftop",
        x: 57, y: 28, width: 12, height: 14
    },
    {
        name: "Lift Lobby",
        category: "Other",
        description: "Shared landing between the four flats",
        x: 50, y: 50, width: 26, height: 20
    },
    {
        name: "Main Staircase",
        category: "Staircase",
        description: "Main stairs running the full height of the building",
        x: 44, y: 72, width: 12, height: 14
    },
    {
        name: "Fire Exit Staircase",
        category: "Emergency Exit",
        description: "Protected fire stairs, keep clear at all times",
        x: 57, y: 72, width: 12, height: 14
    }
];

const buildLayout = () => {

    const locations = [
        ...basement.map((item) => ({ ...item, floor: "B1" })),
        ...ground.map((item) => ({ ...item, floor: "G" })),
        ...rooftop.map((item) => ({ ...item, floor: "R" }))
    ];

    for (let floor = 1; floor <= 11; floor++) {
        locations.push(
            ...residentialFloor(floor).map((item) => ({
                ...item,
                floor: String(floor)
            }))
        );
    }

    return locations;
};

const run = async () => {

    await connectDB();

    let added = 0;
    let skipped = 0;
    let updated = 0;

    for (const item of buildLayout()) {

        const exists = await BuildingLocation.findOne({
            name: item.name,
            floor: item.floor
        });

        // if (!exists) {
        //     await BuildingLocation.create(item);
        //     added++;
        // } else if (item.flatNumber && exists.flatNumber !== item.flatNumber) {
        //     // fills in the flat number on layouts seeded before flats were
        //     // linked to residents through User.flatNumber
        //     exists.flatNumber = item.flatNumber;
        //     await exists.save();
        //     updated++;
        // } else {
        //     skipped++;
        // }

        if (!exists) {
            await BuildingLocation.create(item);
            added++;
        } else if (item.category === "Flat") {
            let changed = false;

            if (exists.flatNumber !== item.flatNumber) {
                exists.flatNumber = item.flatNumber;
                changed = true;
            }
            
            if (!exists.state) {
                exists.state = item.state;
                changed = true
            }

            if (changed) {
                await exists.save();
                updated++;
            } else {
                skipped++;
            }
        } else {
            skipped++;
        }
    }

    console.log(`Added: ${added} locations`);
    console.log(`Updated: ${updated} locations`);
    console.log(`Already up to date: ${skipped} locations`);
    console.log("Seeding done.");
    process.exit(0);
};

run();
