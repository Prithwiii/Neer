import express from "express";
import { getIntercomResidents } from "../controller/intercomController";
import authMiddleware from "../middleware/authMiddleware";
import { updateIntercomAccess } from "../controller/intercomController";

const router = express.Router();

router.get(
    "/residents",
    authMiddleware,
    getIntercomResidents
);
router.put(
    "/access", 
    authMiddleware,
    updateIntercomAccess
);

export default router;