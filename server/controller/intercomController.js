import User from "../models/User.js";

export const getIntercomResidents = async (req, res) => {
    try {
        if (req.user.role !== "staff" || !req.user.intercomAccess) {
            return res.status(403).json({
                message: "You do not have permission to initiate intercom calls",
            });
        }
        const residents = await User.find({
            type: "resident",
            intercomEnabled: true,
        }).select("_id username email");

        res.json(residents);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const updateIntercomAccess = async (req, res) => {
    try {
        if (req.user.role !== "committee") {
            return res.status(403).json({
                message: "Only committee members can manage intercom access",
            });
        }
        const {
            email, intercomEnabled, intercomAccess,
        } = req.body;

        if (!email) {
            return status(400).json({
                message:"Email is required",
            });
        }
        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        });
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.role === "resident") {
            user.intercomEnabled = Boolean(intercomEnabled);
            user.intercomAccess = false;
        } 
        else if (user.role === "staff") {
            user.intercomAccess = Boolean(intercomAccess);
            user.intercomEnabled = false;
        }
        else if (user.role === "committee") {
            user.intercomAccess = Boolean(intercomAccess);
            user.intercomEnabled = Boolean(intercomEnabled);
        }

        await user.save();
        return res.status(200).jaon({
            message: "Intercom permission updated successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                type: user.role,
                intercomEnabled: user.intercomEnabled,
                intercomAccess: user.intercomAccess,
            },
        });
    } catch (error) {
        console.error("Update intercom access error:", error);
        return res.status(500).json({
            message: "Server error while updating intercom permissions",
        });
    }
};

export const getIntercomUser = async (req, res) => {
    try {
        if (req.user.role !== "committee") {
            return res.status(403).json({
                message: "Only committee members can manage intercom access",
            });
        }
        const {email} = req.query;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        }).select(
            "_id username email type intercomEnabled intercomAccess"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.json({
            user,
        });

    } catch (error) {
        console.error("Get intercom user error:", error);

        return res.status(500).json({
            message: "Server error",
        });

    }
};