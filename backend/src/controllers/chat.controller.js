
import chatModel from "../models/chat.model.js";






 async function createChat(req,res) {
    const {title} = req.body;
    const user = req.user;
    const chat = await chatModel.create({
        user:user.id,
        title
    });
    
    
    res.status(201).json({
        message:"Chat created successfully",
        chat:{
            title: chat.title,
        user: chat.user,
        lastActivity: chat.lastActivity
        },
        
    });
    
}


export default {
    createChat
}