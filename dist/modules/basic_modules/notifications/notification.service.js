"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const queryBuilder_1 = __importDefault(require("../../../builder/queryBuilder"));
const notification_model_1 = require("./notification.model");
// const getConversationDB = async (conversationId: string, query: Record<string, unknown>) => {
//     const messageQuery = new queryBuilder(messageModel.find({ conversationId: conversationId }), query).sort()
//     const { totalData } = await messageQuery.paginate(messageModel.find({ conversationId: conversationId }))
//     const data = await messageQuery.modelQuery.exec()
//     const currentPage = Number(query?.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const pagination = messageQuery.calculatePagination({
//         totalData,
//         currentPage,
//         limit,
//     });
//     return { pagination, data, };
// }
const getMyNotification = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const notificationQuery = new queryBuilder_1.default(notification_model_1.NotificationModel.find({ userId: userId }), query).sort();
    const { totalData } = yield notificationQuery.paginate(notification_model_1.NotificationModel.find({ userId: userId }));
    const notifications = yield notificationQuery.modelQuery.exec();
    const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = notificationQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, notifications, };
});
exports.notificationService = {
    getMyNotification
};
