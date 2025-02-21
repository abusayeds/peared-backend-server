import mongoose, { model, Schema, Types } from "mongoose";
import { TConversation } from "./messages.interface";

const ConversationSchema = new Schema(
    {
      projectId: { type: Types.ObjectId, required: true, ref: "Project" },
      providerId: { type: Types.ObjectId, required: true, ref: "User" },
      userId: { type: Types.ObjectId, required: true, ref: "User" },
    },
    { timestamps: true }
  );
  
 export  const conversationModel = mongoose.model<TConversation>("Conversation", ConversationSchema);
 

  const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: String, required: true },
    messageText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  } , { timestamps: true });
  
  export const messageModel = mongoose.model("Message", messageSchema);
 