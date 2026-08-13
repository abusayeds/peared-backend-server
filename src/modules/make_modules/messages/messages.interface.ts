import { Types } from "mongoose";

export type TConversation = {
  projectId?: Types.ObjectId | null;
  providerId: Types.ObjectId;
  userId: Types.ObjectId;
  type: "direct" | "project";
  userLastReadAt?: Date | null;
  providerLastReadAt?: Date | null;
};
