import express from "express";

import protect from "../middleware/authMiddleware.js";
import {
  getContacts,
  getContactsByCategory,
} from "../controller/contactController.js";

const router = express.Router();

router.get("/", protect, getContacts);
router.get("/:category", protect, getContactsByCategory);

export default router;
