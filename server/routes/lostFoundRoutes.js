import express from "express";

import {
    getLostFoundPosts,
    getLostFoundPost,
    createLostFoundPost,
    updateLostFoundPost,
    setLostFoundStatus,
    deleteLostFoundPost
} from "../controller/lostFoundController.js";

import protect from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

// the board belongs to the people living in the building, so posting is left to
// residents and committee members while everyone signed in can read it
const canPost = [protect, requireRole("resident", "committee")];

router.get("/", protect, getLostFoundPosts);
router.get("/:id", protect, getLostFoundPost);

router.post("/", canPost, createLostFoundPost);
router.put("/:id", canPost, updateLostFoundPost);

router.patch("/:id/resolve", canPost, setLostFoundStatus("Returned"));
router.patch("/:id/reopen", canPost, setLostFoundStatus("Active"));

router.delete("/:id", canPost, deleteLostFoundPost);

export default router;
