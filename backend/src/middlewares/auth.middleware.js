

import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";


async function authUser (req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send("Unauthorized!");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne({
            _id: decoded.id
        });
    req.user = user;
    next();
    } catch (error) {
        return res.status(401).send("Unauthorized!");
        
    }
    
}

export default {
    authUser
}