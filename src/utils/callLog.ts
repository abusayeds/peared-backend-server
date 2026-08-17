import { Server as SocketIOServer } from "socket.io";
import { NotificationModel } from "../modules/basic_modules/notifications/notification.model";
import {
  conversationModel,
  messageModel,
} from "../modules/make_modules/messages/messages.model";

export type CallStatus = "completed" | "missed" | "rejected" | "cancelled";

const formatDuration = (sec: number) => {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r} sec`;
  if (r === 0) return `${m} min`;
  return `${m} min ${r} sec`;
};

export const callPreviewText = (status: CallStatus, durationSeconds = 0) => {
  if (status === "completed") return `Audio call · ${formatDuration(durationSeconds)}`;
  if (status === "missed") return "Missed audio call";
  if (status === "rejected") return "Call declined";
  return "Cancelled audio call";
};

export const saveCallEvent = async ({
  io,
  emitToUser,
  conversationId,
  callerId,
  calleeId,
  callerName,
  status,
  durationSeconds = 0,
}: {
  io?: SocketIOServer;
  emitToUser: (id: string, event: string, payload: any) => void;
  conversationId: string;
  callerId: string;
  calleeId: string;
  callerName?: string;
  status: CallStatus;
  durationSeconds?: number;
}) => {
  const messageText = callPreviewText(status, durationSeconds);
  const msg = await messageModel.create({
    conversationId,
    senderId: String(callerId),
    messageText,
    type: "call",
    callStatus: status,
    durationSeconds: durationSeconds || 0,
  });
  await conversationModel.findByIdAndUpdate(conversationId, {
    updatedAt: new Date(),
  });

  const payload = typeof (msg as any).toObject === "function" ? (msg as any).toObject() : msg;
  io?.to(String(conversationId)).emit("receiveMessage", payload);
  emitToUser(callerId, "receiveMessage", payload);
  emitToUser(calleeId, "receiveMessage", payload);

  if (status === "missed") {
    const notif = {
      userId: calleeId,
      message: `Missed audio call from ${callerName || "someone"}`,
      title: "Missed call",
      status: true,
      seen: false,
    };
    emitToUser(calleeId, "receiveNotification", notif);
    emitToUser(calleeId, "inbox:unread", {
      conversationId: String(conversationId),
    });
    await NotificationModel.create({
      userId: calleeId,
      message: notif.message,
      status: true,
      seen: false,
    }).catch(() => null);
  }
};
