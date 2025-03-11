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
exports.getFeedback = exports.giveFeedback = void 0;
const http_status_1 = __importDefault(require("http-status"));
const user_service_1 = require("../user/user.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const feedback_service_1 = require("./feedback.service");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const config_1 = require("../../../config");
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
exports.giveFeedback = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { heard, enjoy, rating, feedback } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "No token provided or invalid format.");
    }
    const token = authHeader.split(" ")[1];
    const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET_KEY);
    const userId = decoded.id;
    // Find the user by userId
    const user = yield (0, user_service_1.findUserById)(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "This account does not exist.");
    }
    // Convert userId (string) to Types.ObjectId
    if (Number(rating) > 5) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "rating must be 1 to 5");
    }
    // Create feedback
    const name = user.name;
    const email = user.email;
    const addFeedback = yield (0, feedback_service_1.createFeedback)({
        heard,
        enjoy,
        rating,
        feedback,
        name,
        email,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Feedback given successfully",
        data: addFeedback,
        pagination: undefined,
    });
}));
exports.getFeedback = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const date = req.query.date;
    const name = req.query.name;
    const email = req.query.email;
    const { feedbacks, totalFeedbacks, totalPages } = yield (0, feedback_service_1.feedbackList)(page, limit, date, name, email);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    if (feedbacks.length === 0) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: false,
            message: "No feedbacks yet.",
            data: [],
            pagination: {
                totalPage: totalPages,
                currentPage: page,
                prevPage: prevPage !== null && prevPage !== void 0 ? prevPage : 1,
                nextPage: nextPage !== null && nextPage !== void 0 ? nextPage : 1,
                limit,
                totalItem: totalFeedbacks,
            },
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "all feedbacks retrieved successfully",
        data: feedbacks,
        pagination: {
            totalPage: totalPages,
            currentPage: page,
            prevPage: prevPage !== null && prevPage !== void 0 ? prevPage : 1,
            nextPage: nextPage !== null && nextPage !== void 0 ? nextPage : 1,
            limit,
            totalItem: totalFeedbacks,
        },
    });
}));
