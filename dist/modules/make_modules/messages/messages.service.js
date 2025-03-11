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
exports.messageservice = void 0;
const queryBuilder_1 = __importDefault(require("../../../builder/queryBuilder"));
const messages_model_1 = require("./messages.model");
const getConversationDB = (conversationId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const messageQuery = new queryBuilder_1.default(messages_model_1.messageModel.find({ conversationId: conversationId }), query).sort();
    const { totalData } = yield messageQuery.paginate(messages_model_1.messageModel.find({ conversationId: conversationId }));
    const data = yield messageQuery.modelQuery.exec();
    const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = messageQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, data, };
});
exports.messageservice = {
    getConversationDB
};
