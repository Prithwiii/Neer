import crypto from "crypto";
import bcrypt from "bcryptjs";
import Guest from "../models/Guest.js";

const generatePasscode = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

export const registerGuest = async (req, res) => {
    try {
        const {
            residentName,
            flatNumber,
            visitDate,
            guestName,
            guestPhone
        } = req.body;

        if (!residentName || !flatNumber ||
            !visitDate || !guestName || !guestPhone) {
                return res.status(400).json({
                    message: "All fields are required."});
            }
        
            const passcode = generatePasscode();
            const passcodeHash = await bcrypt.hash(passcode, 10);
            const guest = await Guest.create({residentName,
                flatNumber, visitDate, guestName, guestPhone,
                passcodeHash, registeredBy: req.user._id});
            
            res.status(201).json({
                massage: "Guest registered successfully.",
                guestId: guest._id,
                passcode});            
    } catch (error) {
        console.error("Register guest error:", error);
        res.status(500).json({
            message: "Failed to register guest."
        });
    }
};

export const validateGuest = async (req, res) => {
    try {
        const {
            residentName,
            flatNumber,
            guestPhone,
            passcode
        } = req.body;

        if (!residentName || !flatNumber ||
            !guestPhone || !passcode) {
            return res.status(400).json({
                message: "All fields are required."});
        }

        const guests = await Guest.find({
            residentName: residentName.trim(),
            flatNumber: flatNumber.trim(),
            guestPhone: guestPhone.trim()
        });

        if (!guest.length) {
            return res.status(404).json({
                message: "No matching guest registration found."
            });
        }

        let matchedGuest = null;
        for (const guest of guests) {
            const validPasscode = await bcrypt.compare(
                passcode, guest.passcodeHash
            );

            if (validPasscode) {
                matchedGuest = guests;
                break;
            }
        }

        if (!matchedGuest) {
            return res.status(401).json({
                message: "Invalid guest passcode."
            });
        }

        if (matchedGuest.checkedIn) {
            return res.status(409).json({
                message: "This guest pass has already been used."
            });
        }

        res.status(200).json({
            message: "Guest validated successfully.",
            guest: {
                _id: matchedGuest._id,
                residentName: matchedGuest.residentName,
                flatNumber: matchedGuest.flatNumber,
                visitDate: matchedGuest.visitDate,
                guestName: matchedGuest.guestName,
                guestPhone: matchedGuest.guestPhone,
                checkedIn: matchedGuest.checkedIn
            }
        });

    } catch (error) {
        console.error("Validate guest error:", error);

        res.status(500).json({
            message: "Failed to validate guest."
        });
    }
};

export const confirmGuestVisit = async (req, res) => {
    try {
        const {id} = req.params;
        const guest = await Guest.findById(id);

        if(!guest){
            return res.status(404).json({
                mressage: "Guest registration not found."
            });
        }

        if(guest.checkedIn) {
            return res.status(409).json({
                message: "This guest has already checked in."
            });
        }

        guest.checkedIn = true;
        guest.checkedInAt = new Data();

        await guest.save();

        res.status(200).json({
            message: "Guest visit confirmed successfully.",
            guest: {
                _id: guest._id,
                guestName: guest.guestName,
                residentName: guest.residentName,
                flatNumber: guest.flatNumber,
                checkedIn: guest.checkedIn,
                checkedInAt: guest.checkedInAt
            }
        });

    } catch (error) {
        console.error("Confirm guest visit error:", error);

        res.status(500).json({
            message: "Failed to confirm guest visit."
        });
    } 
};