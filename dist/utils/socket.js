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
const notification_model_1 = require("../modules/basic_modules/notifications/notification.model");
const messages_model_1 = require("../modules/make_modules/messages/messages.model");
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
    exports.io.on("connection", (socket) => {
        console.log("Socket just connected:", socket.id);
        socket.on('joinConversation', (data) => {
            const { conversationId } = data;
            socket.join(conversationId);
            console.log(`Socket ${socket.id} conversation ${conversationId} join us`);
        });
        socket.on('sendMessage', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { conversationId, senderId, messageText } = data;
            try {
                const message = new messages_model_1.messageModel({
                    conversationId,
                    senderId,
                    messageText
                });
                yield message.save();
                exports.io.to(conversationId).emit('receiveMessage', message);
            }
            catch (err) {
                console.error(err);
            }
        }));
        socket.on("disconnect", () => {
            console.log(socket.id, "just disconnected");
        });
    });
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
