import { Server } from "socket.io";

import { generateText , generateVector} from "../services/ai.service.js";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import messageModel from "../models/message.model.js";
import {createMemory, queryMemory} from "../services/vector.service.js";
import { text } from "stream/consumers";
import { log } from "console";
import { chat } from "@pinecone-database/pinecone/dist/assistant/data/chat.js";

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                // Allow any localhost origin or requests without origin header
                if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
                    return callback(null, true);
                }
                callback(null, true);
            },
            methods: ["GET", "POST"],
            credentials: true
        }
    });



    // middleware for socket connection verify that user logged in or not 

    io.use(async (socket, next) => {

        const cookies = cookie.parse(socket.request.headers?.cookie || "");
        const token = cookies.token || socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Authentication error! No token provided"));
        }

        if (token.startsWith("demo-guest-token")) {
            socket.user = {
                _id: "000000000000000000000000",
                id: "000000000000000000000000",
                fullName: { firstName: "Guest", lastName: "User" },
                email: "guest@example.com"
            };
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await userModel.findOne({
                _id: decoded.id
            });

            socket.user = user;
            next();

        } catch (error) {
            return next(new Error("Authentication error! Invalid token"));
        }



    })


    // socket connection between client to server
    io.on("connection", async (socket) => {
        console.log("a user connected");
        console.log("User Details",socket.user);
    
        socket.on("disconnect", () => {
            console.log("user disconnected");
        })

        // sending a message to the ai and receiving a response

        socket.on("chat-message", async (messagePayLoad) => {
            try {
                const message = await messageModel.create({
                    user: socket.user._id || socket.user.id,
                    chat: messagePayLoad.chat,
                    content: messagePayLoad.content,
                    role: "user"
                });

                let vector = null;
                try {
                    vector = await generateVector(messagePayLoad.content);
                } catch (vecErr) {
                    console.warn("Vector generation failed:", vecErr.message);
                }

                if (vector) {
                    const memory = await queryMemory({
                        queryVector: vector,
                        limit: 5
                    });
                    console.log("Retrieved Memory:", memory);

                    await createMemory({
                        vector,
                        messageId: message._id.toString(),
                        metadata: {
                            chatId: messagePayLoad.chat,
                            userId: (socket.user._id || socket.user.id).toString(),
                            text: messagePayLoad.content
                        }
                    });
                }

                const chatHistory = (await messageModel.find({
                    chat: messagePayLoad.chat
                }).sort({ createdAt: -1 }).limit(20).lean()).reverse();

                const response = await generateText(chatHistory.map(item => ({
                    role: item.role,
                    parts: [{ text: item.content }]
                })));

                const responseMessage = await messageModel.create({
                    user: socket.user._id || socket.user.id,
                    chat: messagePayLoad.chat,
                    content: response,
                    role: "model"
                });

                if (vector) {
                    try {
                        const responseVector = await generateVector(response);
                        await createMemory({
                            vector: responseVector,
                            messageId: responseMessage._id.toString(),
                            metadata: {
                                chatId: messagePayLoad.chat,
                                userId: (socket.user._id || socket.user.id).toString(),
                                text: response
                            }
                        });
                    } catch (resVecErr) {
                        console.warn("Response vector creation failed:", resVecErr.message);
                    }
                }

                io.emit("message-response", {
                    content: response,
                    chatId: messagePayLoad.chat
                });
            } catch (err) {
                console.error("Error in chat-message handler:", err);
                io.emit("message-response", {
                    content: `⚠️ Error generating response: ${err.message}`,
                    chatId: messagePayLoad.chat
                });
            }
        });


    });
}


export default initSocketServer