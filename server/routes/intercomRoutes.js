import express from "express";
import { 
    getIntercomResidents, updateIntercomAccess, getIntercomUser, startIntercomCall,
    } from "../controller/intercomController.js";
import authMiddleware from "../middleware/authMiddleware.js";
// import { updateIntercomAccess } from "../controller/intercomController.js";

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
router.get(
    "/user",
    authMiddleware,
    getIntercomUser
);
router.post(
    "/call",
    authMiddleware,
    startIntercomCall
);

export default router;