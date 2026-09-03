import mongoose from "mongoose";

import FamilySheet from "../models/FamilySheet.js";
import FamilyExpense, { EXPENSE_CATEGORIES } from "../models/FamilyExpense.js";
import User from "../models/User.js";

// only the username and flat number are ever sent back, never the email
const PERSON_FIELDS = "username flatNumber";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-\d{2}$/;

// money is kept to two decimals so totals never drift
const round2 = (value) => Math.round(value * 100) / 100;

// Loads a sheet and checks the signed in user is allowed to see it. Everything
// that touches a sheet or its expenses goes through here, so a user outside the
// family can never reach another family's data.
const loadSheetForUser = async (sheetId, user) => {
    if (!mongoose.Types.ObjectId.isValid(sheetId)) {
        return { status: 404, message: "Family expense sheet not found" };
    }

    const sheet = await FamilySheet.findById(sheetId)
        .populate("owner", PERSON_FIELDS)
        .populate("members", PERSON_FIELDS);

    if (!sheet) {
        return { status: 404, message: "Family expense sheet not found" };
    }

    const userId = user._id.toString();
    const isOwner = sheet.owner._id.toString() === userId;
    const isMember = sheet.members.some(
        (member) => member._id.toString() === userId
    );

    if (!isOwner && !isMember) {
        // a 404 rather than a 403 so outsiders cannot even confirm the sheet exists
        return { status: 404, message: "Family expense sheet not found" };
    }

    return { sheet, isOwner };
};

// validates the fields shared by creating and renaming a sheet
const readSheetInput = (body) => {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
        typeof body.description === "string" ? body.description.trim() : "";

    if (!name) {
        return { error: "Family name is required" };
    }

    if (name.length > 60) {
        return { error: "Family name must be 60 characters or less" };
    }

    if (description.length > 300) {
        return { error: "Description must be 300 characters or less" };
    }

    return { values: { name, description } };
};

// validates the fields shared by adding and editing an expense
const readExpenseInput = (body) => {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const category = body.category === undefined ? "Other" : body.category;
    const date = typeof body.date === "string" ? body.date.trim() : "";
    const amount = Number(body.amount);

    if (!title) {
        return { error: "Expense name is required" };
    }

    if (title.length > 60) {
        return { error: "Expense name must be 60 characters or less" };
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        return { error: "Amount must be a number greater than 0" };
    }

    if (amount > 10000000) {
        return { error: "Amount is too large" };
    }

    if (!EXPENSE_CATEGORIES.includes(category)) {
        return { error: "A valid category is required" };
    }

    if (!DATE_PATTERN.test(date) || Number.isNaN(Date.parse(date))) {
        return { error: "A valid date is required" };
    }

    if (note.length > 300) {
        return { error: "Note must be 300 characters or less" };
    }

    return {
        values: {
            title,
            amount: round2(amount),
            category,
            date,
            // the month is derived from the date so the two can never disagree
            month: date.slice(0, 7),
            note
        }
    };
};

// GET the sheets the signed in user owns or has been given access to
export const getFamilySheets = async (req, res) => {
    try {
        const sheets = await FamilySheet.find({
            $or: [{ owner: req.user._id }, { members: req.user._id }]
        })
            .populate("owner", PERSON_FIELDS)
            .populate("members", PERSON_FIELDS)
            .sort({ createdAt: -1 })
            .lean();

        if (sheets.length === 0) {
            return res.status(200).json([]);
        }

        // one grouped query instead of two per sheet
        const totals = await FamilyExpense.aggregate([
            { $match: { sheet: { $in: sheets.map((sheet) => sheet._id) } } },
            {
                $group: {
                    _id: "$sheet",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalsBySheet = new Map(
            totals.map((item) => [item._id.toString(), item])
        );

        res.status(200).json(
            sheets.map((sheet) => {
                const summary = totalsBySheet.get(sheet._id.toString());

                return {
                    ...sheet,
                    isOwner: sheet.owner._id.toString() === req.user._id.toString(),
                    totalAmount: summary ? round2(summary.total) : 0,
                    expenseCount: summary ? summary.count : 0
                };
            })
        );
    } catch (error) {
        console.error("Error fetching family expense sheets:", error);
        res.status(500).json({
            message: "Failed to fetch family expense sheets"
        });
    }
};

// POST a new family expense sheet, the creator becomes its owner
export const createFamilySheet = async (req, res) => {
    try {
        const { error, values } = readSheetInput(req.body);

        if (error) {
            return res.status(400).json({ message: error });
        }

        const sheet = await FamilySheet.create({
            ...values,
            owner: req.user._id,
            members: []
        });

        await sheet.populate("owner", PERSON_FIELDS);

        res.status(201).json({
            ...sheet.toObject(),
            isOwner: true,
            totalAmount: 0,
            expenseCount: 0
        });
    } catch (error) {
        console.error("Error creating family expense sheet:", error);
        res.status(500).json({
            message: "Failed to create the family expense sheet"
        });
    }
};

// GET one sheet, only for the owner and the members with access
export const getFamilySheet = async (req, res) => {
    try {
        const access = await loadSheetForUser(req.params.sheetId, req.user);

        if (access.status) {
            return res.status(access.status).json({ message: access.message });
        }

        res.status(200).json({
            ...access.sheet.toObject(),
            isOwner: access.isOwner
        });
    } catch (error) {
        console.error("Error fetching family expense sheet:", error);
        res.status(500).json({
            message: "Failed to fetch the family expense sheet"
        });
    }
};

// PUT the sheet name and description, owner only
export const updateFamilySheet = async (req, res) => {
    try {
        const access = await loadSheetForUser(req.params.sheetId, req.user);

        if (access.status) {
            return res.status(access.status).json({ message: access.message });
        }

        if (!access.isOwner) {
            return res.status(403).json({
                message: "Only the sheet owner can manage the sheet"
            });
        }

        const { error, values } = readSheetInput(req.body);

        if (error) {
            return res.status(400).json({ message: error });
        }

        access.sheet.set(values);
        await access.sheet.save();

        res.status(200).json({
            ...access.sheet.toObject(),
            isOwner: true
        });
    } catch (error) {
        console.error("Error updating family expense sheet:", error);
        res.status(500).json({
            message: "Failed to update the family expense sheet"
        });
    }
};

// DELETE a sheet along with every expense on it, owner only
export const deleteFamilySheet = async (req, res) => {
    try {
        const access = await loadSheetForUser(req.params.sheetId, req.user);

        if (access.status) {
            return res.status(access.status).json({ message: access.message });
        }

        if (!access.isOwner) {
            return res.status(403).json({
                message: "Only the sheet owner can delete the sheet"
            });
        }

        await FamilyExpense.deleteMany({ sheet: access.sheet._id });
        await access.sheet.deleteOne();

        res.status(200).json({ message: "Family expense sheet deleted" });
    } catch (error) {
        console.error("Error deleting family expense sheet:", error);
        res.status(500).json({
            message: "Failed to delete the family expense sheet"
        });
    }
};

// GET the accounts the owner can still add to the sheet, owner only
export const getAvailableMembers = async (req, res) => {
    try {
        const access = await loadSheetForUser(req.params.sheetId, req.user);

        if (access.status) {
            return res.status(access.status).json({ message: access.message });
        }

        if (!access.isOwner) {
            return res.status(403).json({
                message: "Only the sheet owner can manage members"
            });
        }

        const alreadyOnSheet = [
            access.sheet.owner._id,
            ...access.sheet.members.map((member) => member._id)
        ];

        const filter = {
            role: { $ne: "staff" },
            _id: { $nin: alreadyOnSheet }
        };

        const search =
            typeof req.query.search === "string" ? req.query.search.trim() : "";

        if (search) {
            // escaped so a search like "10-A" is treated as plain text
            const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const pattern = new RegExp(safe, "i");

            filter.$or = [{ username: pattern }, { flatNumber: pattern }];
        }

        const residents = await User.find(filter)
            .select(PERSON_FIELDS)
            .sort({ username: 1 })
            .limit(20);

        res.status(200).json(residents);
    } catch (error) {
        console.error("Error fetching available family members:", error);
        res.status(500).json({
            message: "Failed to fetch the resident list"
        });
    }
};

// POST a resident onto the sheet, owner only
export const addFamilyMember = async (req, res) => {
    try {
        const access = await loadSheetForUser(req.params.sheetId, req.user);

        if (access.status) {
            return res.status(access.status).json({ message: access.message });
        }

        if (!access.isOwner) {
            return res.status(403).json({
                message: "Only the sheet owner can add members"
            });
        }

        const { userId } = req.body;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Select a resident to add"
            });
        }

        if (access.sheet.owner._id.toString() === userId) {
            return res.status(400).json({
                message: "The owner already has access to this sheet"
            });
        }

        const alreadyAdded = access.sheet.members.some(
            (member) => member._id.toString() === userId
        );

        if (alreadyAdded) {
            return res.status(400).json({
                message: "That resident is already on this sheet"
            });
        }

        if (access.sheet.members.length >= 15) {
            return res.status(400).json({
                message: "A sheet can hold at most 15 members"
            });
        }

        const resident = await User.findOne({
            _id: userId,
            role: { $ne: "staff" }
        });

        if (!resident) {
            return res.status(400).json({
                message: "That resident is not a valid account"
            });
        }

        access.sheet.members.push(resident._id);
        await access.sheet.save();
        await access.sheet.populate("members", PERSON_FIELDS);

        res.status(200).json({
            ...access.sheet.toObject(),
            isOwner: true
        });
    } catch (error) {
        console.error("Error adding a family member:", error);
        res.status(500).json({
            message: "Failed to add the family member"
        });
    }
};

// DELETE a member's access to the sheet, owner only
export const removeFamilyMember = async (req, res) => {
    try {
        const access = await loadSheetForUser(req.params.sheetId, req.user);

        if (access.status) {
            return res.status(access.status).json({ message: access.message });
        }

        if (!access.isOwner) {
            return res.status(403).json({
                message: "Only the sheet owner can remove members"
            });
        }

        const { userId } = req.params;

        const isMember = access.sheet.members.some(
            (member) => member._id.toString() === userId
        );

        if (!isMember) {
            return res.status(404).json({
                message: "That member is not on this sheet"
            });
        }

        // the expenses they already added stay on the sheet, only their access goes
        access.sheet.members = access.sheet.members.filter(
            (member) => member._id.toString() !== userId
        );

        await access.sheet.save();
        await access.sheet.populate("members", PERSON_FIELDS);

        res.status(200).json({
            ...access.sheet.toObject(),
            isOwner: true
        });
    } catch (error) {
        console.error("Error removing a family member:", error);
        res.status(500).json({
            message: "Failed to remove the family member"
        });
    }
};

// GET the expenses on a sheet for one month, plus the summary figures
export const getFamilyExpenses = async (req, res) => {
    try {
        const access = await loadSheetForUser(req.params.sheetId, req.user);

        if (access.status) {
            return res.status(access.status).json({ message: access.message });
        }

        const month =
            typeof req.query.month === "string" ? req.query.month.trim() : "";

        if (month && !MONTH_PATTERN.test(month)) {
            return res.status(400).json({
                message: "Month must use the format 2026-09"
            });
        }

        const filter = { sheet: access.sheet._id };

        if (month) {
            filter.month = month;
        }

        const expenses = await FamilyExpense.find(filter)
            .populate("addedBy", PERSON_FIELDS)
            .sort({ date: -1, createdAt: -1 })
            .lean();

        // the running total for the whole sheet, not just the month on screen
        const [allTime] = await FamilyExpense.aggregate([
            { $match: { sheet: access.sheet._id } },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const categoryTotals = {};
        let monthTotal = 0;

        for (const expense of expenses) {
            monthTotal += expense.amount;

            categoryTotals[expense.category] = round2(
                (categoryTotals[expense.category] || 0) + expense.amount
            );
        }

        res.status(200).json({
            expenses,
            summary: {
                month,
                monthTotal: round2(monthTotal),
                monthCount: expenses.length,
                allTimeTotal: allTime ? round2(allTime.total) : 0,
                allTimeCount: allTime ? allTime.count : 0,
                categoryTotals
            }
        });
    } catch (error) {
        console.error("Error fetching family expenses:", error);
        res.status(500).json({
            message: "Failed to fetch the family expenses"
        });
    }
};

// POST a new expense, any member of the sheet can add one
export const createFamilyExpense = async (req, res) => {
    try {
        const access = await loadSheetForUser(req.params.sheetId, req.user);

        if (access.status) {
            return res.status(access.status).json({ message: access.message });
        }

        const { error, values } = readExpenseInput(req.body);

        if (error) {
            return res.status(400).json({ message: error });
        }

        const expense = await FamilyExpense.create({
            ...values,
            sheet: access.sheet._id,
            addedBy: req.user._id
        });

        await expense.populate("addedBy", PERSON_FIELDS);

        res.status(201).json(expense);
    } catch (error) {
        console.error("Error creating a family expense:", error);
        res.status(500).json({
            message: "Failed to add the expense"
        });
    }
};

// Loads an expense and checks the user may change it. Following the same rule
// the househelp postings use: the person who added it, or the sheet owner.
const loadExpenseForUser = async (expenseId, user) => {
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
        return { status: 404, message: "Expense not found" };
    }

    const expense = await FamilyExpense.findById(expenseId);

    if (!expense) {
        return { status: 404, message: "Expense not found" };
    }

    const access = await loadSheetForUser(expense.sheet.toString(), user);

    if (access.status) {
        return { status: 404, message: "Expense not found" };
    }

    const isAuthor = expense.addedBy.toString() === user._id.toString();

    if (!isAuthor && !access.isOwner) {
        return {
            status: 403,
            message:
                "Only the person who added this expense or the sheet owner can change it"
        };
    }

    return { expense };
};

// PUT an existing expense
export const updateFamilyExpense = async (req, res) => {
    try {
        const found = await loadExpenseForUser(req.params.expenseId, req.user);

        if (found.status) {
            return res.status(found.status).json({ message: found.message });
        }

        const { error, values } = readExpenseInput(req.body);

        if (error) {
            return res.status(400).json({ message: error });
        }

        found.expense.set(values);
        await found.expense.save();
        await found.expense.populate("addedBy", PERSON_FIELDS);

        res.status(200).json(found.expense);
    } catch (error) {
        console.error("Error updating a family expense:", error);
        res.status(500).json({
            message: "Failed to save the expense"
        });
    }
};

// DELETE an expense
export const deleteFamilyExpense = async (req, res) => {
    try {
        const found = await loadExpenseForUser(req.params.expenseId, req.user);

        if (found.status) {
            return res.status(found.status).json({ message: found.message });
        }

        await found.expense.deleteOne();

        res.status(200).json({ message: "Expense deleted" });
    } catch (error) {
        console.error("Error deleting a family expense:", error);
        res.status(500).json({
            message: "Failed to delete the expense"
        });
    }
};
