import { Server as HttpServer } from "http";
// import { jwt } from 'jsonwebtoken';
import { Socket, Server as SocketIOServer } from "socket.io";
import { NotificationModel } from "../modules/basic_modules/notifications/notification.model";
import { conversationModel, messageModel } from "../modules/make_modules/messages/messages.model";
export let io: SocketIOServer;
const socketMap: Map<string, any> = new Map();
const userMap: Map<string, string> = new Map();

export const initSocketIO = async (server: HttpServer): Promise<void> => {
  console.log("Initializing Socket.IO server...");
  const { Server } = await import("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true,
    },
  });
  console.log("Socket.IO server initialized!");

  io.on("connection", async (socket: Socket) => {
    try {
      socket.on('joinConversation', (data) => {
        const { conversationId } = data;
        socket.join(conversationId);
      });
      socket.on('sendMessage', async (data) => {
        const { conversationId, senderId, messageText } = data;
        try {
          const message = new messageModel({
            conversationId,
            senderId,
            messageText
          });
          await message.save();
          io.to(conversationId).emit('receiveMessage', message);
          const receiver = await conversationModel.findById(conversationId).populate({ path: "providerId", select: "name image" }).populate({ path: "userId", select: "name image" }) as unknown as any
          if (senderId === receiver?.providerId._id.toString()) {
            socketMap.get(receiver?.providerId._id).emit(`receiveNotification`, {
              userId: senderId,
              message: message.messageText,
              status: true,
              seen: false,
              image: receiver?.providerId.image,
              title: `New Message From ${receiver?.providerId?.name}`
            })
          } else {
            socketMap.get(receiver.userId._id).emit(`receiveNotification`, {
              userId: senderId,
              message: message.messageText,
              status: true,
              seen: false,
              image: receiver?.providerId.image,
              title: `New Message From ${receiver?.providerId?.name}`
            })
          }
        } catch (err: any) {
          console.error(err.message);
        }
      });
    } catch (error) {
      console.log(error);
    }
    socket.on("disconnect", () => {
      console.log(socket.id, "just disconnected");
    });
  });

};

export const sendNotification = async (message: any) => {
  io.emit("receiveNotification", message);
  const notification = await NotificationModel.create(message);
  if (notification) {
    console.log('created notification ! ');
  }
};

