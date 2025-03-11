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
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackList = exports.createFeedback = void 0;
const feedback_model_1 = require("./feedback.model");
const createFeedback = (feedbackData) => __awaiter(void 0, void 0, void 0, function* () {
    const promoCode = yield feedback_model_1.FeedbackModel.create(feedbackData);
    return promoCode.toObject(); // Convert to plain object
});
exports.createFeedback = createFeedback;
const feedbackList = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10, date, name, email) {
    const skip = (page - 1) * limit;
    const query = { isDeleted: { $ne: true } }; // Filter out promo codes where isDeleted is true
    if (name) {
        query.name = { $regex: name, $options: "i" };
    }
    if (email) {
        query.email = { $regex: email, $options: "i" };
    }
    if (date) {
        const [day, month, year] = date.split("-").map(Number);
        const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, -1));
        query.createdAt = { $gte: startDate, $lte: endDate };
    }
    const feedbacks = yield feedback_model_1.FeedbackModel.aggregate([
        { $match: query },
        {
            $setWindowFields: {
                sortBy: { createdAt: -1 },
                output: {
                    serial: {
                        $documentNumber: {},
                    },
                },
            },
        },
        {
            $project: {
                serial: 1,
                rating: 1,
                email: 1,
                enjoy: 1,
                heard: 1,
                name: 1,
                feedback: 1,
                createdAt: 1,
            },
        },
        { $skip: skip },
        { $limit: limit },
    ]);
    const totalFeedbacks = yield feedback_model_1.FeedbackModel.countDocuments(query);
    const totalPages = Math.ceil(totalFeedbacks / limit);
    return { feedbacks, totalFeedbacks, totalPages };
});
exports.feedbackList = feedbackList;
