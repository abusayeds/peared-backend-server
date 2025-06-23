"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.initSocketIO = exports.io = void 0;
const decoded_1 = require("../middlewares/decoded");
const notification_model_1 = require("../modules/basic_modules/notifications/notification.model");
const user_service_1 = require("../modules/basic_modules/user/user.service");
const messages_model_1 = require("../modules/make_modules/messages/messages.model");
const socketMap = new Map();
const userMap = new Map();
const initSocketIO = (server) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Initializing Socket.IO server...");
    const { Server } = yield Promise.resolve().then(() => __importStar(require("socket.io")));
    exports.io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: true,
        },
    });
    console.log("Socket.IO server initialized!");
    exports.io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const token = socket.handshake.query.token;
        const { decoded } = yield (0, decoded_1.socketTokenDecoded)(token);
        if (decoded === null || decoded === void 0 ? void 0 : decoded.user) {
            console.log("A user connected:", (_a = decoded === null || decoded === void 0 ? void 0 : decoded.user) === null || _a === void 0 ? void 0 : _a.email);
            // io.emit('user-status-updated', { isActive: true, lastActive: Date.now() });
            (0, user_service_1.updateUserActivity)((_b = decoded === null || decoded === void 0 ? void 0 : decoded.user) === null || _b === void 0 ? void 0 : _b._id);
        }
        else {
            console.log("User not authenticated, disconnecting...");
            socket.disconnect();
        }
        try {
            socket.on('joinConversation', (data) => {
                const { conversationId } = data;
                console.log("On join conversation", data);
                socket.join(conversationId);
                try {
                    messages_model_1.conversationModel.findById(conversationId).populate({ path: "providerId", select: "isActive" }).populate({ path: "userId", select: "isActive" }).then((res) => {
                        if (decoded.user.role === "provider") {
                            exports.io.emit("active-inactive", res.userId);
                            console.log('if', res.userId);
                        }
                        else {
                            exports.io.emit("active-inactive", res.providerId);
                            console.log('else', res.providerId);
                        }
                    });
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
                }
                catch (error) {
                    console.error("Error retrieving conversation data:", error);
                }
            });
            socket.on('sendMessage', (data) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
                const { conversationId, senderId, messageText } = data;
                try {
                    const message = new messages_model_1.messageModel({
                        conversationId,
                        senderId,
                        messageText
                    });
                    yield message.save();
                    exports.io.to(conversationId).emit('receiveMessage', message);
                    const receiver = yield messages_model_1.conversationModel.findById(conversationId).populate({ path: "providerId", select: "name image" }).populate({ path: "userId", select: "name image" });
                    if (senderId === (receiver === null || receiver === void 0 ? void 0 : receiver.providerId._id.toString())) {
                        socketMap.get(receiver === null || receiver === void 0 ? void 0 : receiver.providerId._id).emit(`receiveNotification`, {
                            userId: senderId,
                            message: message.messageText,
                            status: true,
                            seen: false,
                            image: receiver === null || receiver === void 0 ? void 0 : receiver.providerId.image,
                            title: `New Message From ${(_a = receiver === null || receiver === void 0 ? void 0 : receiver.providerId) === null || _a === void 0 ? void 0 : _a.name}`
                        });
                    }
                    else {
                        socketMap.get(receiver.userId._id).emit(`receiveNotification`, {
                            userId: senderId,
                            message: message.messageText,
                            status: true,
                            seen: false,
                            image: receiver === null || receiver === void 0 ? void 0 : receiver.providerId.image,
                            title: `New Message From ${(_b = receiver === null || receiver === void 0 ? void 0 : receiver.providerId) === null || _b === void 0 ? void 0 : _b.name}`
                        });
                    }
                }
                catch (err) {
                    console.error(err.message);
                }
            }));
        }
        catch (error) {
            console.log(error);
        }
        socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            const token = socket.handshake.query.token;
            const { decoded } = yield (0, decoded_1.socketTokenDecoded)(token);
            if (decoded === null || decoded === void 0 ? void 0 : decoded.user) {
                (0, user_service_1.setUserInactive)((_a = decoded === null || decoded === void 0 ? void 0 : decoded.user) === null || _a === void 0 ? void 0 : _a._id);
                console.log((_b = decoded === null || decoded === void 0 ? void 0 : decoded.user) === null || _b === void 0 ? void 0 : _b.email, "just disconnected");
            }
            exports.io.emit("active-inactive", { userId: (_c = decoded === null || decoded === void 0 ? void 0 : decoded.user) === null || _c === void 0 ? void 0 : _c._id, isActive: false });
        }));
    }));
});
exports.initSocketIO = initSocketIO;
const sendNotification = (message) => __awaiter(void 0, void 0, void 0, function* () {
    exports.io.emit("receiveNotification", message);
    const notification = yield notification_model_1.NotificationModel.create(message);
    if (notification) {
        console.log('created notification ! ');
    }
});
exports.sendNotification = sendNotification;
function myConversation(_a) {
    return __awaiter(this, arguments, void 0, function* ({ chatId }) {
        return yield messages_model_1.conversationModel.findById(chatId).populate({ path: "providerId", select: "isActive" }).populate({ path: "userId", select: "isActive" });
    });
}
