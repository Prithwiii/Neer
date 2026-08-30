import express from "express";
import { getFlats, updateFlatState } from "../controller/flatController.js";

const router = express.Router();

router.get("/", getFlats);
router.put("/:id/state", updateFlatState);

export default router;