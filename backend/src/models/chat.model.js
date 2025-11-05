import mongoose from "mongoose";   


const chatSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    title: {
        type: String,
        required: true
    },


})    


const chatModel = mongoose.model("chats", chatSchema);
export default chatModel