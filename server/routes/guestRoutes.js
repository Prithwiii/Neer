import express from "express";

import {
    registerGuest,
    validateGuest,
    confirmGuestVisit
} from "../controller/guestController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// Staff-only middleware
const staffOnly = (req, res, next) => {
    if (req.user?.role !== "staff") {
        return res.status(403).json({
            message: "Staff access required."
        });
    }

    next();
};


// Register guest
router.post(
    "/register",
    authMiddleware,
    staffOnly,
    registerGuest
);


// Validate guest
router.post(
    "/validate",
    authMiddleware,
    staffOnly,
    validateGuest
);


// Confirm guest visit
router.patch(
    "/:id/confirm",
    authMiddleware,
    staffOnly,
    confirmGuestVisit
);


export default router;