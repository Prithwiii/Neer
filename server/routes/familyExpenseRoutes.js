import express from "express";

import {
    getFamilySheets,
    createFamilySheet,
    getFamilySheet,
    updateFamilySheet,
    deleteFamilySheet,
    getAvailableMembers,
    addFamilyMember,
    removeFamilyMember,
    getFamilyExpenses,
    createFamilyExpense,
    updateFamilyExpense,
    deleteFamilyExpense
} from "../controller/familyExpenseController.js";

import protect from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

// family sheets belong to the people living in the building, staff accounts
// are not part of a family so they are kept out of the whole feature
const familyOnly = [protect, requireRole("resident", "committee")];

router.get("/sheets", familyOnly, getFamilySheets);
router.post("/sheets", familyOnly, createFamilySheet);

router.get("/sheets/:sheetId", familyOnly, getFamilySheet);
router.put("/sheets/:sheetId", familyOnly, updateFamilySheet);
router.delete("/sheets/:sheetId", familyOnly, deleteFamilySheet);

router.get("/sheets/:sheetId/members/available", familyOnly, getAvailableMembers);
router.post("/sheets/:sheetId/members", familyOnly, addFamilyMember);
router.delete("/sheets/:sheetId/members/:userId", familyOnly, removeFamilyMember);

router.get("/sheets/:sheetId/expenses", familyOnly, getFamilyExpenses);
router.post("/sheets/:sheetId/expenses", familyOnly, createFamilyExpense);

router.put("/expenses/:expenseId", familyOnly, updateFamilyExpense);
router.delete("/expenses/:expenseId", familyOnly, deleteFamilyExpense);

export default router;
