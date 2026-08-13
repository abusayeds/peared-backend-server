import mongoose, { model, Schema, Types } from "mongoose";
import { TConversation } from "./messages.interface";

const ConversationSchema = new Schema(
  {
    projectId: { type: Types.ObjectId, required: false, ref: "Project", default: null },
    providerId: { type: Types.ObjectId, required: true, ref: "User" },
    userId: { type: Types.ObjectId, required: true, ref: "User" },
    type: {
      type: String,
      enum: ["direct", "project"],
      default: "direct",
    },
  },
  { timestamps: true }
);

ConversationSchema.index(
  { userId: 1, providerId: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "direct" },
  }
);

export const conversationModel = mongoose.model<TConversation>(
  "Conversation",
  ConversationSchema
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: { type: String, required: true },
    messageText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const messageModel = mongoose.model("Message", messageSchema);
