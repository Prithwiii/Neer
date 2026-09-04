// Shared bits for the family expense tracker. The categories match
// EXPENSE_CATEGORIES in server/models/FamilyExpense.js.

export const EXPENSE_CATEGORIES = [
    "Food",
    "Bills",
    "Transport",
    "Health",
    "Education",
    "Shopping",
    "Other"
];

// maps a category onto the .cat-* colour classes already used by the layout
const CATEGORY_CLASS = {
    Food: "flat",
    Bills: "entrance",
    Transport: "exit",
    Health: "emergency",
    Education: "elevator",
    Shopping: "staircase",
    Other: "other"
};

export const categoryClass = (category) => CATEGORY_CLASS[category] || "other";

// "2026-09"
export const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

// "2026-09-03"
export const getToday = () => new Date().toISOString().slice(0, 10);

// "September 2026"
export const formatMonthLabel = (month) => {
    const [year, monthNum] = month.split("-").map(Number);

    return new Date(year, monthNum - 1, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });
};

// "Sep 3"
export const formatDayLabel = (date) => {
    const [year, month, day] = date.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
};

export const shiftMonth = (month, offset) => {
    const [year, monthNum] = month.split("-").map(Number);
    const date = new Date(year, monthNum - 1 + offset, 1);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

// thousands separators, e.g. 12500 becomes "12,500"
export const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-US", {
        maximumFractionDigits: 2
    });
