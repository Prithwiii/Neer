// Building levels, listed top down so the floor selector reads like the real
// building. The keys must match BUILDING_FLOORS on the server.
export const FLOORS = [
  { key: "R", short: "R", label: "Rooftop" },
  { key: "11", short: "11", label: "11th Floor" },
  { key: "10", short: "10", label: "10th Floor" },
  { key: "9", short: "9", label: "9th Floor" },
  { key: "8", short: "8", label: "8th Floor" },
  { key: "7", short: "7", label: "7th Floor" },
  { key: "6", short: "6", label: "6th Floor" },
  { key: "5", short: "5", label: "5th Floor" },
  { key: "4", short: "4", label: "4th Floor" },
  { key: "3", short: "3", label: "3rd Floor" },
  { key: "2", short: "2", label: "2nd Floor" },
  { key: "1", short: "1", label: "1st Floor" },
  { key: "G", short: "G", label: "Ground Floor" },
  { key: "B1", short: "B", label: "Basement" },
];

export const CATEGORIES = [
  "Flat",
  "Entrance",
  "Exit",
  "Emergency Exit",
  "Elevator",
  "Staircase",
  "Facility",
  "Parking",
  "Security",
  "Other",
];

// css class suffix for each category, the colours live in App.css
export const CATEGORY_CLASS = {
  Flat: "flat",
  Entrance: "entrance",
  Exit: "exit",
  "Emergency Exit": "emergency",
  Elevator: "elevator",
  Staircase: "staircase",
  Facility: "facility",
  Parking: "parking",
  Security: "security",
  Other: "other",
};

export const floorLabel = (key) => {
  const floor = FLOORS.find((item) => item.key === key);
  return floor ? floor.label : key;
};

export const categoryClass = (category) =>
  CATEGORY_CLASS[category] || "other";
