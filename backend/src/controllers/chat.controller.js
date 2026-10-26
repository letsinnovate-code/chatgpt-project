
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

async function createChat(req, res) {
    try {
        const { title } = req.body;
        const user = req.user;
        const chat = await chatModel.create({
            user: user._id || user.id,
            title: title || "New Chat"
        });

        res.status(201).json({
            message: "Chat created successfully",
            chat: {
                id: chat._id,
                title: chat.title,
                user: chat.user,
                lastActivity: chat.lastActivity
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create chat", error: error.message });
    }
}

async function getChats(req, res) {
    try {
        const userId = req.user._id || req.user.id;
        const chats = await chatModel.find({ user: userId }).sort({ updatedAt: -1 });
        res.status(200).json({
            chats: chats.map(c => ({
                id: c._id,
                title: c.title,
                user: c.user,
                lastActivity: c.lastActivity,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to get chats", error: error.message });
    }
}

async function getChatMessages(req, res) {
    try {
        const { chatId } = req.params;
        const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });
        res.status(200).json({
            messages: messages.map(m => ({
                id: m._id,
                chat: m.chat,
                user: m.user,
                content: m.content,
                role: m.role,
                createdAt: m.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to get messages", error: error.message });
    }
}

async function deleteChat(req, res) {
    try {
        const { chatId } = req.params;
        await chatModel.findByIdAndDelete(chatId);
        await messageModel.deleteMany({ chat: chatId });
        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete chat", error: error.message });
    }
}

export default {
    createChat,
    getChats,
    getChatMessages,
    deleteChat
}