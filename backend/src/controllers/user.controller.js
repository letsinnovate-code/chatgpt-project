import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


async function registerUser (req, res) {
    try {
        const {fullName:{firstName, lastName} = {}, email, password} = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const isUserAlreadyExists = await userModel.findOne({email: normalizedEmail});

        if (isUserAlreadyExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create ({
            fullName:{
                firstName: firstName.trim(),
                lastName: lastName.trim()
            },
            email: normalizedEmail,
            password: hashedPassword
        });

        const token = jwt.sign ({
            id: user._id
        }, process.env.JWT_SECRET);

        res.cookie("token", token);

        res.status(201).json ({
            message: "User created successfully",
            user:{
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                token
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Failed to register user" });
    }
}

async function loginUser (req, res) {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required!" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await userModel.findOne({email: normalizedEmail});

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password!" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid email or password!" });
        }

        const token = jwt.sign ({
            id: user._id
        }, process.env.JWT_SECRET);

        res.cookie("token", token);

        res.status(200).json ({
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Failed to log in" });
    }
}

// Reset password using email
async function forgotPassword (req, res) {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: "Email and new password are required." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ message: "No account found with this email address." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            message: "Password updated successfully. You can now log in with your new password."
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Failed to reset password." });
    }
}

// Retrieve authenticated user profile
async function getUserProfile (req, res) {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized!" });
        }

        const user = await userModel.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Failed to fetch profile." });
    }
}

// Update user profile and/or change password
async function updateUser (req, res) {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized!" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const { fullName, firstName, lastName, email, currentPassword, newPassword } = req.body;

        // If email is being changed, check if it's already in use
        if (email && email.trim().toLowerCase() !== user.email) {
            const normalizedEmail = email.trim().toLowerCase();
            const emailInUse = await userModel.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
            if (emailInUse) {
                return res.status(400).json({ message: "This email address is already in use by another account." });
            }
            user.email = normalizedEmail;
        }

        // Update full name
        const newFirst = fullName?.firstName || firstName;
        const newLast = fullName?.lastName || lastName;

        if (newFirst !== undefined && newFirst.trim() !== '') {
            user.fullName.firstName = newFirst.trim();
        }
        if (newLast !== undefined && newLast.trim() !== '') {
            user.fullName.lastName = newLast.trim();
        }

        // Update password if newPassword is provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to set a new password." });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect." });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters long." });
            }

            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully.",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Failed to update profile." });
    }
}

export default {
    registerUser,
    loginUser,
    forgotPassword,
    getUserProfile,
    updateUser
};


