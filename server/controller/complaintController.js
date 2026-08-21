import Complaint from "../models/Complaint.js";

const complaintFields = "title description flatNumber complainant status verifiedBy rejectedBy createdAt updatedAt verifiedAt rejectedAt";

const getComplaints = async (req, res) => {
  try {
    const query = req.user.role === "staff" ? {} : { status: "verified" };
    const complaints = await Complaint.find(query)
      .select(complaintFields)
      .populate("complainant", "username email role")
      .populate("verifiedBy", "username")
      .populate("rejectedBy", "username")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
};

const createComplaint = async (req, res) => {
  try {
    const { title, description, flatNumber } = req.body;

    if (!title?.trim() || !description?.trim() || !flatNumber?.trim()) {
      return res.status(400).json({ message: "Title, description and flat number are required" });
    }

    const complaint = await Complaint.create({
      title: title.trim(),
      description: description.trim(),
      flatNumber: flatNumber.trim(),
      complainant: req.user._id,
    });

    await complaint.populate("complainant", "username email role");
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Failed to submit complaint", error: error.message });
  }
};

const updateComplaintStatus = (status) => async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (complaint.status !== "pending") {
      return res.status(400).json({ message: "Only pending complaints can be reviewed" });
    }

    complaint.status = status;
    if (status === "verified") {
      complaint.verifiedBy = req.user._id;
      complaint.verifiedAt = new Date();
      complaint.rejectedBy = null;
      complaint.rejectedAt = null;
    } else {
      complaint.rejectedBy = req.user._id;
      complaint.rejectedAt = new Date();
      complaint.verifiedBy = null;
      complaint.verifiedAt = null;
    }

    await complaint.save();
    await complaint.populate("complainant", "username email role");
    await complaint.populate("verifiedBy", "username");
    await complaint.populate("rejectedBy", "username");
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Failed to update complaint", error: error.message });
  }
};

export { getComplaints, createComplaint, updateComplaintStatus };
