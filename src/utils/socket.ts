import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { messageModel } from "../modules/make_modules/messages/messages.model";


let io: SocketIOServer;

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

  io.on("connection", (socket: Socket) => {
    console.log("Socket just connected:", socket.id);

    socket.on('joinConversation', (data) => {
      const { conversationId } = data;
      socket.join(conversationId);
      console.log(`Socket ${socket.id} conversation ${conversationId} join us`);
    });

    socket.on('sendMessage', async (data) => {
      const { conversationId, senderId, messageText } = data;
      console.log(data);

      try {
        const message = new messageModel({
          conversationId,
          senderId,
          messageText
        });
        await message.save();
        io.to(conversationId).emit('receiveMessage', message);
        console.log(`Message from ${senderId} in conversation ${conversationId}: ${messageText}`);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconnect", () => {
      console.log(socket.id, "just disconnected");
    });
  });
};

