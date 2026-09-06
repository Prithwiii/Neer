import BuildingLocation from "../models/BuildingLocation.js";
import User from "../models/User.js";

const VALID_STATES = ["For Sale", "To-Let", "Occupied"];

const normalizeFlatNumber = (value) => {
    const normalized = String(value || "").trim().toUpperCase();
    const compactMatch = normalized.match(/^(\d+)([A-Z])$/);

    return compactMatch
        ? `${compactMatch[1]}-${compactMatch[2]}`
        : normalized;
};

const flatNumberPattern = (flatNumber) => new RegExp(
    `^${String(flatNumber).replace("-", "-?")}$`,
    "i"
);

export const getFlats = async (req, res) => {
    try {
        const flats = await BuildingLocation.find({
            category: "Flat"
        }).sort({floor: 1, flatNumber: 1});

        const users = await User.find(
            {
                flatNumber: {$exists: true, $nin: [null, ""]}
            },
            "username email role flatNumber" );
        
        const result = flats.map((flat) => {
            const flatNumber = normalizeFlatNumber(flat.flatNumber);
            const residents = users
                .filter((user) => normalizeFlatNumber(user.flatNumber) === flatNumber)
                .map((user) => ({
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }))

            return {
                _id: flat._id,
                name: flat.name,
                floor: flat.floor,
                flatNumber: flat.flatNumber,
                // Occupied is derived from current assignments. A stale
                // persisted Occupied value must not survive after residents
                // move away or are removed.
                state: residents.length > 0
                    ? "Occupied"
                    : flat.state === "Occupied"
                        ? "For Sale"
                        : flat.state,
                residents
            };
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching flats:", error);
        res.status(500).json({
            message: "Failed to fetch flats"
        });
    }
};

export const updateFlatState = async (req, res) => {
    try {
        const { id } = req.params;
        const { state } = req.body;

        if (!VALID_STATES.includes(state)) {
            return res.status(400).json({
                message: "Invalid flat state"
            });
        }

        const flat = await BuildingLocation.findOne({
            _id: id,
            category: "Flat"
        });

        if (!flat) {
            return res.status(404).json({
                message: "Flat not found"
            });
        }

        if (state === "Occupied") {
            const hasResident = await User.exists({
                flatNumber: flatNumberPattern(flat.flatNumber),
                role: { $ne: "staff" }
            });

            if (!hasResident) {
                return res.status(400).json({
                    message: "A flat can only be occupied when residents are assigned"
                });
            }
        }

        flat.state = state;

        await flat.save();

        res.json({
            message: "Flat state updated successfully",
            flat: {
                _id: flat._id,
                name: flat.name,
                floor: flat.floor,
                flatNumber: flat.flatNumber,
                state: flat.state
            }
        });
    } catch (error) {
        console.error("Error updating flat state:", error);

        res.status(500).json({
            message: "Failed to update flat state"
        });
    }
};