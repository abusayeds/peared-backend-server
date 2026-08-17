import { Types } from "mongoose";

export type TConversation = {
  projectId?: Types.ObjectId | null;
  providerId: Types.ObjectId;
  userId: Types.ObjectId;
  type: "direct" | "project";
  userLastReadAt?: Date | null;
  providerLastReadAt?: Date | null;
};

export type TMessage = {
  conversationId: Types.ObjectId;
  senderId: string;
  messageText: string;
  type?: "text" | "call";
  callStatus?: "completed" | "missed" | "rejected" | "cancelled";
  durationSeconds?: number;
};
