import mongoose, { Schema } from "mongoose";
import { INotification } from "./notification.interface";
const NotificationSchema: Schema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, required: true },
  message: { type: String, required: true },
  status: { type: Boolean, required: false },
  seen: { type: Boolean, default: false }
}, { timestamps: true },);

export const NotificationModel = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);