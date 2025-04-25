import { Server as HttpServer } from "http";
// import { jwt } from 'jsonwebtoken';
import { Socket, Server as SocketIOServer } from "socket.io";
import { socketTokenDecoded } from "../middlewares/decoded";
import { NotificationModel } from "../modules/basic_modules/notifications/notification.model";
import { setUserInactive, updateUserActivity } from "../modules/basic_modules/user/user.service";
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
    const token = socket.handshake.query.token


    const { decoded }: any = await socketTokenDecoded(token)


    if (decoded?.user) {
      console.log("A user connected:", decoded?.user?.email);
      // io.emit('user-status-updated', { isActive: true, lastActive: Date.now() });
      updateUserActivity(decoded?.user?._id);

    } else {
      console.log("User not authenticated, disconnecting...");
      socket.disconnect();
    }
    try {
      socket.on('joinConversation', (data) => {
        const { conversationId } = data;
        console.log("On join conversation", data);
        socket.join(conversationId);
        try {
          conversationModel.findById(conversationId).populate({ path: "providerId", select: "isActive" }).populate({ path: "userId", select: "isActive" }).then((res: any) => {
            if (decoded.user.role === "provider") {
              io.emit("active-inactive", res.userId)
              console.log('if', res.userId);

            } else {
              io.emit("active-inactive", res.providerId)
              console.log('else', res.providerId);
            }
          })
          // const chat = myConversation({ chatId: conversationId }) as unknown as {
          //   _id: string;
          //   projectId: string;
          //   providerId: {
          //     _id: string;
          //     isActive: Boolean
          //   };
          //   userId: {
          //     _id: string;
          //     isActive: Boolean
          //   };
          //   createdAt: Date;
          //   updatedAt: Date;
          //   __v: number
          // }
          // console.log(chat);
          // if (decoded.user.role === "provider") {
          //   io.emit("active-inactive", chat.userId)
          //   console.log('if', chat.userId);

          // } else {
          //   io.emit("active-inactive", chat.providerId)
          //   console.log('else', chat.providerId);
          // }
        } catch (error) {
          console.error("Error retrieving conversation data:", error);
        }
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
    socket.on("disconnect", async () => {
      const token = socket.handshake.query.token
      const { decoded }: any = await socketTokenDecoded(token)
      if (decoded?.user) {
        setUserInactive(decoded?.user?._id);
        console.log(decoded?.user?.email, "just disconnected");
      }
      io.emit("active-inactive", { userId: decoded?.user?._id, isActive: false })

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


async function myConversation({ chatId }: { chatId: string }): Promise<any> {
  return await conversationModel.findById(chatId).populate({ path: "providerId", select: "isActive" }).populate({ path: "userId", select: "isActive" })
}