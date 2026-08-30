import BuildingLocation from "../models/BuildingLocation.js";
import User from "../models/User.js";

const VALID_STATES = ["For Sale", "To-Let", "Occupied"];

export const getFlats = async (req, res) => {
    try {
        const flats = await BuildingLocation.find({
            category: "Flat"
        }).sort({floor: 1, flatNumber: 1});

        const flatNumbers = flats.map((flat) => flat.flatNumber);

        const users = await User.find(
            {
                flatNumber: {$in: flatNumbers}
            },
            "username email role flatNumber" );
        
        const result = flats.map(flat => ({
            _id: flat._id,
            name: flat.name,
            floor: flat.floor,
            flatNumber: flat.flatNumber,
            state: flat.state,
            residents: users
                .filter((user) => user.flatNumber === flat.flatNumber)
                .map((user) => ({
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }))
        }));

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