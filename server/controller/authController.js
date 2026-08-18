console.log("auth routes loaded");

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";

export const registerUser = async(req, res) => {

    try{

        const {username, email, password, flatNumber} = req.body;
        const role = req.body.role || "resident";

        if (role !== "staff" && !/^\d+-[A-Z]$/.test(flatNumber || "")) {
            return res.status(400).json({
                message: "Flat number must use the format 10-A"
            });
        }

        const existingUser = await User.findOne({email});

        if(existingUser){

            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
            flatNumber: role === "staff" ? undefined : flatNumber.toUpperCase()
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            flatNumber: user.flatNumber || null,
            token: generateToken(user._id)
        });
    }

    catch(error){
        res.status(500).json({
            message: error.message
        });
    }
};



export const loginUser = async(req, res) => {

    try{

        const {email, password} = req.body;

        const user = await User.findOne({email});
        
        if(!user){

            return res.status(401).json({
                message:"Invalid credentials"
            });
        }

        const isMatch = await comparePassword(
            password,
            user.password
        );

        if(!isMatch){

            return res.status(401).json({
                message: "Invalid credentials"
            });
        }
        
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            flatNumber: user.flatNumber || null,
            intercomEnabled: user.intercomEnabled,
            intercomAccess: user.intercomAccess,
            token: generateToken(user._id)
        });
    }

    catch(error){

        res.status(500).json({
            message: error.message
        });
    }

};



export const getProfile = async (req, res) => {

    const user = await User.findById(req.user.id).select("-password");

    res.json(user);

};