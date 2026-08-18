import express from "express";
import { 
    getIntercomResidents, updateIntercomAccess, getIntercomUser,
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

export default router;