import express from "express";

import {
    getHousehelpPostings,
    createHousehelpPosting,
    closeHousehelpPosting,
} from "../controller/househelpController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getHousehelpPostings);
router.post("/", protect, createHousehelpPosting);
router.patch("/:id/close", protect, closeHousehelpPosting);

export default router;