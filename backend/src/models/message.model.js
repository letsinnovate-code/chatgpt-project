import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chats",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ["user", "model"],
        required: true
    }

    

}, {
    timestamps: true
})


const messageModel = mongoose.model("messages", messageSchema);
export default messageModel