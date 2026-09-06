import express from "express";
import protect from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import {
  getComplaints,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint,
} from "../controller/complaintController.js";

const router = express.Router();

router.get("/", protect, getComplaints);
router.post("/", protect, requireRole("resident", "committee"), createComplaint);
router.patch("/:id/verify", protect, requireRole("staff"), updateComplaintStatus("verified"));
router.patch("/:id/reject", protect, requireRole("staff"), updateComplaintStatus("rejected"));
router.delete("/:id", protect, requireRole("staff"), deleteComplaint);

export default router;
