import Notice from "../models/Notice.js";

const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find()
            .populate("postedBy", "username")
            .sort({ createdAt: -1 });
        res.status(200).json(notices);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch notices",
            error: error.message
        });
    }
};

const createNotice = async (req, res) => {
    try {
        if (req.user.role !== "committee") {
            return res.status(403).json({
                message: "Only committee members can post notices"
            });
        }

        const { title, description, category } = req.body;

        const notice = await Notice.create({
            title,
            description,
            category,
            postedBy: req.user._id,
        });

        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create notice",
            error: error.message
        });
    }
};

export {
    getNotices,
    createNotice
};