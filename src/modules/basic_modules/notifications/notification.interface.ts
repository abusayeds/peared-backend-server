import { Types } from "mongoose";

export type INotification = {
  userId: Types.ObjectId;
  message: string;
  status: boolean
  seen: boolean;
} 
