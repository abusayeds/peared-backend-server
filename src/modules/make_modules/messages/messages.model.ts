import mongoose, { Schema, Types } from "mongoose";
import { TConversation } from "./messages.interface";

/** One chat thread per user ↔ provider pair (never duplicate). */
const ConversationSchema = new Schema(
  {
    projectId: {
      type: Types.ObjectId,
      required: false,
      ref: "Project",
      default: null,
    },
    providerId: { type: Types.ObjectId, required: true, ref: "User" },
    userId: { type: Types.ObjectId, required: true, ref: "User" },
    type: {
      type: String,
      enum: ["direct", "project"],
      default: "direct",
    },
    userLastReadAt: { type: Date, default: null },
    providerLastReadAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ConversationSchema.index({ userId: 1, providerId: 1 }, { unique: true });

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
    type: {
      type: String,
      enum: ["text", "call"],
      default: "text",
    },
    callStatus: {
      type: String,
      enum: ["completed", "missed", "rejected", "cancelled"],
      required: false,
    },
    durationSeconds: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const messageModel = mongoose.model("Message", messageSchema);
