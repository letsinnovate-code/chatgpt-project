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
    const io = new Server(httpServer, {});


    // middleware for socket connection verify that user logged in or not 

    io.use(async (socket, next) => {

        const cookies = cookie.parse(socket.request.headers?.cookie || "");

        if (!cookies.token) {
            return next(new Error("Authentication error! No token provided"));
        }

        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

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
            
           
           const message = await messageModel.create({
                user: socket.user.id,
                chat: messagePayLoad.chat,
                content: messagePayLoad.content,
                role: "user"
            });
            const vector = await generateVector(messagePayLoad.content);
            
           const memory = await queryMemory({
                queryVector:vector,
                limit: 5,
                filter:{
                    metadata:{}
                }
               
            })
            console.log(memory);
            
            
            await createMemory({
                vector,
                messageId: message._id,
                metadata:{
                    chatId: messagePayLoad.chat,
                    userId: socket.user.id,
                    text:messagePayLoad.content
                },
               

            })

            const chatHistory = ( await messageModel.find({
                chat: messagePayLoad.chat
            }).sort({createdAt:-1}).limit(20).lean()).reverse();
            
            
            const response = await generateText(chatHistory.map(item => {
                return {
                    role: item.role,
                    parts:[{text: item.content}]
                }
            }));

            const responseVector = await generateVector(response);
          const responseMessage =  await messageModel.create({
                user: socket.user.id,
                chat: messagePayLoad.chat,
                content: response,
                role: "model"
            })

            await createMemory({
                vector: responseVector,
                messageId: responseMessage._id,
                metadata:{
                    chatId: messagePayLoad.chat,
                    userId: socket.user.id,
                    text: response
                },
                
            });
            io.emit("message-response", {
                content: response,
                chatId: messagePayLoad.chat
            });
        });


    });
}


export default initSocketServer