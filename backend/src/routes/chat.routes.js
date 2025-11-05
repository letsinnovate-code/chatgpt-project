import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import chatController from "../controllers/chat.controller.js";


const router = express.Router();

router.post("/chat",authMiddleware.authUser, chatController.createChat);


export default router;