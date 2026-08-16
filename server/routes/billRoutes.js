import express from "express";
import Bill from "../models/Bill.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

const lastDayOfMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0).getDate();

// moves a "YYYY-MM-DD" due date onto the same day-of-month for a new "YYYY-MM" month
const shiftDueDateToMonth = (dueDate, targetMonth) => {
  const day = Number(dueDate.slice(8, 10));
  const [year, month] = targetMonth.split("-").map(Number);
  const safeDay = Math.min(day, lastDayOfMonth(year, month - 1));
  return `${targetMonth}-${String(safeDay).padStart(2, "0")}`;
};

// creates copies of last month's recurring bills for the requested month
const generateRecurringBills = async (userId, month, today) => {
  const previousRecurring = await Bill.find({
    user: userId,
    recurring: true,
    month: { $lt: month },
  }).sort({ month: -1 });

  const latestByName = new Map();
  for (const bill of previousRecurring) {
    if (!latestByName.has(bill.name)) {
      latestByName.set(bill.name, bill);
    }
  }

  const created = [];
  for (const template of latestByName.values()) {
    const dueDate = shiftDueDateToMonth(template.dueDate, month);
    const status = dueDate < today ? "overdue" : "pending";

    const newBill = await Bill.create({
      user: userId,
      name: template.name,
      amount: template.amount,
      category: template.category,
      dueDate,
      month,
      status,
      paidDate: null,
      note: template.note,
      recurring: true,
    });

    created.push(newBill);
  }

  created.sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  return created;
};

// Get the logged-in user's bills for a month (defaults to the current month)
router.get("/", protect, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const month = req.query.month || today.slice(0, 7);

    await Bill.updateMany(
      {
        user: req.user._id,
        month,
        status: "pending",
        dueDate: { $lt: today },
      },
      { status: "overdue" }
    );

    let bills = await Bill.find({ user: req.user._id, month }).sort({
      dueDate: 1,
    });

    if (bills.length === 0) {
      bills = await generateRecurringBills(req.user._id, month, today);
    }

    res.json(bills);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Add a new bill for the logged-in user
router.post("/", protect, async (req, res) => {
  try {
    const { name, amount, category, dueDate, note, recurring } = req.body;

    if (!name || !amount || !dueDate) {
      return res.status(400).json({
        message: "name, amount and dueDate are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const status = dueDate < today ? "overdue" : "pending";

    const bill = await Bill.create({
      user: req.user._id,
      name,
      amount,
      category: category || "Other",
      dueDate,
      month: dueDate.slice(0, 7),
      status,
      note: note || "",
      recurring: !!recurring,
    });

    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Edit a bill (only the resident who added it can edit it)
router.put("/:id", protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        message: "Bill not found",
      });
    }

    if (bill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only edit your own bills",
      });
    }

    const { name, amount, category, dueDate, note, recurring } = req.body;

    if (!name || !amount || !dueDate) {
      return res.status(400).json({
        message: "name, amount and dueDate are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    bill.name = name;
    bill.amount = amount;
    bill.category = category || "Other";
    bill.dueDate = dueDate;
    bill.month = dueDate.slice(0, 7);
    bill.note = note || "";
    bill.recurring = !!recurring;

    if (bill.status !== "paid") {
      const today = new Date().toISOString().slice(0, 10);
      bill.status = dueDate < today ? "overdue" : "pending";
    }

    await bill.save();

    res.json(bill);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Mark a bill as paid
router.post("/:id/pay", protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        message: "Bill not found",
      });
    }

    if (bill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only update your own bills",
      });
    }

    bill.status = "paid";
    bill.paidDate = new Date().toISOString().slice(0, 10);
    await bill.save();

    res.json(bill);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Undo a paid bill back to pending/overdue
router.post("/:id/unpay", protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        message: "Bill not found",
      });
    }

    if (bill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only update your own bills",
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    bill.status = bill.dueDate < today ? "overdue" : "pending";
    bill.paidDate = null;
    await bill.save();

    res.json(bill);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Delete a bill (only the resident who added it can delete it)
router.delete("/:id", protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        message: "Bill not found",
      });
    }

    if (bill.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own bills",
      });
    }

    await bill.deleteOne();

    res.json({ message: "Bill deleted" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
