import jwt from "jsonwebtoken";
import User from "../models/User.js"

const protect = async(req, res, next) => {
    
    let token;

    if(req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer")){

            try{
                
                token = req.headers.authorization.split(" ")[1];
                const decode = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                req.user = await User.findById(decode.id).select("-password");

                next();
            }

            catch(error){

                return res.status(401).json({
                    message: "Token is invalid"
                });
            }
    }
    else{

        return res.status(401).json({
            message: "No token provided"
        });

    }

};

export default protect;