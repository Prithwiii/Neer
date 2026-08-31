import HousehelpPosting from "../models/HousehelpPosting.js";

export const getHousehelpPostings = async (req, res) => {
    try {
        const postings = await HousehelpPosting.find()
            .populate("postedBy", "username role")
            .sort({ createdAt: -1});

        res.status(200).json(postings);
    } catch (error) {
        console.error("Error fetching househelp postings: ", error);
        res.status(500).json({
            message: "Failed to fetch househelp postings",
        });
    }
};

export const createHousehelpPosting = async(req, res) => {
    try {
        // console.log("Househelp request body:", req.body);

        const {
            residentName,
            flatNumber,
            hours,
            mobileNumber,
        } = req.body;

        // console.log("Request body:", req.body);
        // console.log("req.user:", req.user);
        // console.log("req.user._id:", req.user?._id);
        // console.log({
        //   residentName,
        //   flatNumber,
        //   hours,
        //   mobileNumber,
        // });

        if (!residentName || !flatNumber ||
            !hours || !mobileNumber) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const posting = await HousehelpPosting.create({
            residentName, flatNumber,
            hours, mobileNumber, 
            postedBy: req.user._id,
        });

        res.status(201).json({
            message: "Househelp posting created successfully",
            posting,
            });
        } catch (error) {
            console.error("Error creating househelp posting:", error);
            res.status(500).json({
            message: "Failed to create househelp posting",
            // error: error.message,
            });
    }
};

export const closeHousehelpPosting = async (req, res) => {
  try {
    const posting = await HousehelpPosting.findById(req.params.id);

    if (!posting) {
      return res.status(404).json({
        message: "Posting not found",
      });
    }

    const isOwner =
      posting.postedBy.toString() === req.user._id.toString();

    const isStaff = req.user.role === "staff";

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        message: "You are not authorized to close this posting",
      });
    }

    if (posting.status === "closed") {
      return res.status(400).json({
        message: "Posting is already closed",
      });
    }

    posting.status = "closed";
    posting.closedAt = new Date();

    await posting.save();

    res.status(200).json({
      message: "Posting closed successfully",
      posting,
    });
  } catch (error) {
    console.error("Error closing househelp posting:", error);
    res.status(500).json({
      message: "Failed to close posting",
    });
  }
};