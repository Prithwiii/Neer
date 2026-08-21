console.log("seeding default garages");

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import Garage from "./models/Garage.js";

const defaultGarages = [
  { name: "Garage 1", slotNumber: "G-01", description: "Basement slot", owner: "10-A", contactNo: "01383838383" },
  { name: "Garage 2", slotNumber: "G-02", description: "Basement slot", owner: "10-B", contactNo: "01383838384" },
  { name: "Garage 3", slotNumber: "G-03", description: "Basement slot", owner: "11-A", contactNo: "01383838385" },
  { name: "Garage 4", slotNumber: "G-04", description: "Basement slot", owner: "11-B", contactNo: "01383838386" },
  { name: "Garage 5", slotNumber: "G-05", description: "Basement slot", owner: "12-A", contactNo: "01383838387" },
];

const run = async () => {
  await connectDB();

  for (const g of defaultGarages) {
    const exists = await Garage.findOne({ slotNumber: g.slotNumber });
    if (!exists) {
      await Garage.create(g);
      console.log(`Added garage ${g.slotNumber}`);
    } else {
      console.log(`Already exists ${g.slotNumber}`);
    }
  }

  console.log("Garage seeding done.");
  process.exit(0);
};

run();
