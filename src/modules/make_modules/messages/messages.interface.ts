import { Types } from "mongoose";

export type TConversation = {
    projectId: Types.ObjectId;
    providerId: Types.ObjectId;
}