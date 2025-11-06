import { Server } from "socket.io";

import  generateText  from "../services/ai.service.js";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

function initSocketServer(httpServer){
    const io = new Server(httpServer,{});


    // middleware for socket connection verify that user logged in or not 

    io.use(async (socket, next) => {

        const cookies = cookie.parse(socket.request.headers?.cookie || "");

        if(!cookies.token){
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
    io.on("connection",async (socket) => {
        console.log("a user connected");

        socket.on("disconnect", () => {
        console.log("user disconnected");
      })

      // sending a message to the ai and receiving a response

      socket.on("chat-message", async (message) => {
        
        const response = await generateText(message);
        io.emit("message-response", response);
      });
    
      
    });
}


export default initSocketServer