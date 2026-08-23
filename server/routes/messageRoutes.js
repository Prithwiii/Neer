import express from "express";
import { getMessages } from "../controller/messageController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMessages);

export default router;
