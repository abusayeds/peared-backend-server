import { Server as HttpServer } from "http";
import { Socket, Server as SocketIOServer } from "socket.io";
import { CLIENT_URLS, NODE_ENV } from "../config";
import { socketTokenDecoded } from "../middlewares/decoded";
import { NotificationModel } from "../modules/basic_modules/notifications/notification.model";
import { setUserInactive, updateUserActivity } from "../modules/basic_modules/user/user.service";
import { conversationModel, messageModel } from "../modules/make_modules/messages/messages.model";

export let io: SocketIOServer;
const socketMap: Map<string, Socket> = new Map();

export const emitToUser = (userId: string | undefined | null | any, event: string, payload: any) => {
  if (!userId || !io) return;
  const id = String(userId);
  socketMap.get(id)?.emit(event, payload);
};

export const initSocketIO = async (server: HttpServer): Promise<void> => {
  console.log("Initializing Socket.IO server...");
  const { Server } = await import("socket.io");
  io = new Server(server, {
    path: "/socket.io",
    cors: {
      origin: CLIENT_URLS.length > 0 ? CLIENT_URLS : true,
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Render / proxies: allow both; client prefers websocket
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });
  console.log(
    "Socket.IO server initialized!",
    NODE_ENV === "production" && CLIENT_URLS.length
      ? `CORS: ${CLIENT_URLS.join(", ")}`
      : "CORS: reflect / open"
  );

  io.on("connection", async (socket: Socket) => {
    const token = socket.handshake.query.token;
    const { decoded }: any = await socketTokenDecoded(token);
    if (decoded?.user) {
      const userId = decoded.user._id?.toString?.() || String(decoded.user._id);
      console.log("A user connected:", decoded?.user?.email);
      socketMap.set(userId, socket);
      updateUserActivity(decoded?.user?._id);
    } else {
      console.log("User not authenticated, disconnecting...");
      socket.disconnect();
      return;
    }

    try {
      socket.on("joinConversation", (data) => {
        const { conversationId } = data;
        if (!conversationId) return;
        const roomId = String(conversationId);
        socket.join(roomId);
        conversationModel
          .findById(conversationId)
          .populate({ path: "providerId", select: "isActive name image" })
          .populate({ path: "userId", select: "isActive name image" })
          .then((res: any) => {
            if (!res) return;
            if (decoded.user.role === "provider") {
              io.to(roomId).emit("active-inactive", res.userId);
            } else {
              io.to(roomId).emit("active-inactive", res.providerId);
            }
          })
          .catch((error) => console.error("Error retrieving conversation data:", error));
      });

      socket.on("typing", (data) => {
        const { conversationId, userId, name, isTyping } = data || {};
        if (!conversationId) return;
        socket.to(String(conversationId)).emit("typing", {
          conversationId: String(conversationId),
          userId,
          name,
          isTyping: Boolean(isTyping),
        });
      });

      socket.on("sendMessage", async (data) => {
        const { conversationId, senderId, messageText } = data;
        try {
          if (!conversationId || !messageText?.trim()) return;
          const roomId = String(conversationId);
          const message = new messageModel({
            conversationId,
            senderId,
            messageText: messageText.trim(),
          });
          await message.save();
          await conversationModel.findByIdAndUpdate(conversationId, {
            updatedAt: new Date(),
          });
          io.to(roomId).emit("receiveMessage", message);
          // stop typing for sender after send
          socket.to(roomId).emit("typing", {
            conversationId: roomId,
            userId: senderId,
            isTyping: false,
          });

          const conversation = (await conversationModel
            .findById(conversationId)
            .populate({ path: "providerId", select: "name image" })
            .populate({ path: "userId", select: "name image" })) as unknown as any;
          if (!conversation) return;

          const providerId = conversation.providerId?._id?.toString();
          const clientId = conversation.userId?._id?.toString();
          const isFromProvider = String(senderId) === providerId;
          const targetId = isFromProvider ? clientId : providerId;
          const senderDoc = isFromProvider ? conversation.providerId : conversation.userId;

          // Unread for recipient
          const targetRole = isFromProvider ? "user" : "provider";
          const lastRead =
            targetRole === "provider"
              ? conversation.providerLastReadAt
              : conversation.userLastReadAt;
          const unreadFilter: any = {
            conversationId,
            senderId: { $ne: String(targetId) },
          };
          if (lastRead) unreadFilter.createdAt = { $gt: lastRead };
          const threadUnread = await messageModel.countDocuments(unreadFilter);

          emitToUser(targetId, "inbox:unread", {
            conversationId: roomId,
            threadUnread,
          });

          const notif = {
            userId: targetId,
            message: message.messageText,
            status: true,
            seen: false,
            image: senderDoc?.image,
            title: `New Message From ${senderDoc?.name}`,
          };
          emitToUser(targetId, "receiveNotification", notif);
          await NotificationModel.create({
            userId: targetId,
            message: notif.message,
            status: true,
            seen: false,
          }).catch(() => null);
        } catch (err: any) {
          console.error(err.message);
        }
      });
    } catch (error) {
      console.log(error);
    }

    socket.on("disconnect", async () => {
      const token = socket.handshake.query.token;
      const { decoded }: any = await socketTokenDecoded(token);
      if (decoded?.user) {
        const userId = decoded.user._id?.toString?.() || String(decoded.user._id);
        if (socketMap.get(userId) === socket) {
          socketMap.delete(userId);
        }
        setUserInactive(decoded?.user?._id);
        console.log(decoded?.user?.email, "just disconnected");
        io.emit("active-inactive", { _id: decoded?.user?._id, userId: decoded?.user?._id, isActive: false });
      }
    });
  });
};

export const sendNotification = async (message: any) => {
  const targetId = message?.userId ? String(message.userId) : null;
  if (targetId) {
    emitToUser(targetId, "receiveNotification", message);
  } else if (io) {
    io.emit("receiveNotification", message);
  }
  try {
    await NotificationModel.create({
      userId: message.userId,
      message: message.message,
      status: message.status ?? true,
      seen: false,
    });
    console.log("created notification ! ");
  } catch (e) {
    console.error("notification create failed", e);
  }
};

/** Realtime project lifecycle events (bid / approve / done / reject) */
export const emitProjectEvent = (
  userId: string | undefined | null | any,
  event:
    | "bid:created"
    | "bid:approved"
    | "project:providerDone"
    | "project:userOk"
    | "project:userNotOk"
    | "chat:direct",
  payload: Record<string, any>
) => {
  emitToUser(userId, event, payload);
  // also push a lightweight notification for UX
  if (payload?.notificationMessage) {
    sendNotification({
      userId,
      message: payload.notificationMessage,
      title: payload.notificationTitle || "Peared Update",
    });
  }
};
