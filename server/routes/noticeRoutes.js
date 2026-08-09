import express from "express";
import {
    getNotices,
    createNotice
} from "../controller/noticeController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotices);
router.post("/", protect, createNotice);

export default router;