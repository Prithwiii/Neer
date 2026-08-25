import User from "../models/User.js";
import { AccessToken } from "livekit-server-sdk";
import { getIO } from "../config/socket.js";
import crypto from "crypto";

export const getIntercomResidents = async (req, res) => {
    try {
        if (req.user.role !== "staff" || !req.user.intercomAccess) {
            return res.status(403).json({
                message: "You do not have permission to initiate intercom calls",
            });
        }
        const residents = await User.find({
            role: "resident",
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
        return res.status(200).json({
            message: "Intercom permission updated successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
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
            "_id username email role intercomEnabled intercomAccess"
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


export const startIntercomCall = async (req, res) => {
    try {
        // Only staff with intercom access can initiate calls
        if (
            req.user.role !== "staff" ||
            !req.user.intercomAccess
        ) {
            return res.status(403).json({
                message: "You do not have permission to make intercom calls",
            });
        }

        const { residentEmail } = req.body;

        if (!residentEmail) {
            return res.status(400).json({
                message: "Resident email is required",
            });
        }

        // Find resident
        const resident = await User.findOne({
            email: residentEmail.toLowerCase().trim(),
            role: "resident",
        });

        if (!resident) {
            return res.status(404).json({
                message: "Resident not found",
            });
        }

        // Resident must have intercom enabled
        if (!resident.intercomEnabled) {
            return res.status(403).json({
                message: "This resident has intercom disabled",
            });
        }

        // Create a unique room
        const roomName = `intercom-${crypto.randomUUID()}`;

        // Staff token
        const staffToken = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                identity: req.user._id.toString(),
            }
        );

        staffToken.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
        });

        // Resident token
        const residentToken = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                identity: resident._id.toString(),
            }
        );

        residentToken.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
        });

        const staffJWT = await staffToken.toJwt();
        const residentJWT = await residentToken.toJwt();

        // Notify resident
        const io = getIO();

        io.to(`user-${resident._id.toString()}`).emit(
            "incoming-intercom-call",
            {
                roomName,
                staffName: req.user.username,
                token: residentJWT,
                livekitUrl: process.env.LIVEKIT_URL,
            }
        );

        return res.status(200).json({
            message: "Call initiated",
            roomName,
            token: staffJWT,
            livekitUrl: process.env.LIVEKIT_URL,
        });

    } catch (error) {
        console.error("Intercom call error:", error);

        return res.status(500).json({
            message: "Failed to start intercom call",
        });
    }
};