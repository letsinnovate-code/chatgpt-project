import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import chatController from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/chat", authMiddleware.authUser, chatController.createChat);
router.get("/chat", authMiddleware.authUser, chatController.getChats);
router.get("/chats", authMiddleware.authUser, chatController.getChats);
router.get("/chat/:chatId/messages", authMiddleware.authUser, chatController.getChatMessages);
router.delete("/chat/:chatId", authMiddleware.authUser, chatController.deleteChat);

export default router;