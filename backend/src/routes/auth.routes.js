import express from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public Authentication Endpoints
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/forgot-password", userController.forgotPassword);
router.post("/forgotPassword", userController.forgotPassword);

// Protected User Profile Endpoints
router.get("/profile", authMiddleware.authUser, userController.getUserProfile);
router.get("/user/profile", authMiddleware.authUser, userController.getUserProfile);
router.get("/userProfile", authMiddleware.authUser, userController.getUserProfile);

// Protected Update User Endpoints
router.put("/profile", authMiddleware.authUser, userController.updateUser);
router.put("/user/profile", authMiddleware.authUser, userController.updateUser);
router.put("/updateUser", authMiddleware.authUser, userController.updateUser);
router.patch("/updateUser", authMiddleware.authUser, userController.updateUser);

export default router;