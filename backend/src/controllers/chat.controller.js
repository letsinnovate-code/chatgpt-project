
import chatModel from "../models/chat.model.js";



 async function createChat(req,res) {
    const {title} = req.body;
    const user = req.user;
    const chat = await chatModel.create({
        user:user.id,
        title
    });
    res.status(201).json(chat);
    
}


export default {
    createChat
}