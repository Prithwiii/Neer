import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import Contact from "./models/Contact.js";

const defaultContacts = [
  {
    category: "emergency",
    name: "Fire Service",
    phone: "01700000000",
    designation: "Fire Response Unit",
  },
  {
    category: "emergency",
    name: "Ambulance Service",
    phone: "01711111111",
    designation: "Medical Emergency",
  },
  {
    category: "emergency",
    name: "Police Station",
    phone: "01722222222",
    designation: "Emergency Security",
  },
  {
    category: "emergency",
    name: "City General Hospital",
    phone: "01733333333",
    designation: "Urgent Care",
  },
  {
    category: "emergency",
    name: "Building Security Desk",
    phone: "01844444444",
    designation: "Entry Control",
  },
  {
    category: "staff",
    name: "Rakib",
    phone: "01757348678",
    designation: "Guard",
  },
  {
    category: "staff",
    name: "Shahriar",
    phone: "01734567890",
    designation: "Electrician",
  },
  {
    category: "staff",
    name: "Nabil",
    phone: "01811223344",
    designation: "Plumber",
  },
  {
    category: "staff",
    name: "Ayesha",
    phone: "01699887766",
    designation: "Housekeeping Supervisor",
  },
  {
    category: "staff",
    name: "Imran",
    phone: "01855667788",
    designation: "Maintenance Engineer",
  },
  {
    category: "committee",
    name: "Farah Ahmed",
    phone: "01766445588",
    designation: "Chairperson",
  },
  {
    category: "committee",
    name: "Karim Hossain",
    phone: "01799887766",
    designation: "Finance Member",
  },
  {
    category: "committee",
    name: "Sabrina Islam",
    phone: "01822334455",
    designation: "Security Coordinator",
  },
  {
    category: "committee",
    name: "Mahmud Hasan",
    phone: "01677889900",
    designation: "Maintenance Committee",
  },
  {
    category: "committee",
    name: "Tanvir Rahman",
    phone: "01855669922",
    designation: "Resident Welfare Secretary",
  },
];

const run = async () => {
  await connectDB();

  for (const item of defaultContacts) {
    const exists = await Contact.findOne({ category: item.category, name: item.name });

    if (!exists) {
      await Contact.create(item);
      console.log(`Added contact: ${item.category} / ${item.name}`);
    } else {
      console.log(`Already exists: ${item.category} / ${item.name}`);
    }
  }

  console.log("Contact directory seeding complete.");
  process.exit(0);
};

run();
