

import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

async function authUser (req, res, next) {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);
    if (!token) {
        return res.status(401).json({ message: "Unauthorized! No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized! User no longer exists." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized! Invalid or expired token." });
    }
}

export default {
    authUser
};