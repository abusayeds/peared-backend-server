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
exports.providerFeedbackService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const user_model_1 = require("../../basic_modules/user/user.model");
const providerModel_1 = require("./providerModel");
const queryBuilder_1 = __importDefault(require("../../../builder/queryBuilder"));
const createProviderFeedbackDB = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = yield user_model_1.UserModel.findById(payload.providerId);
    if (!provider) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Provider not found !");
    }
    if (provider.role !== "provider") {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Only the provider can give feedback.");
    }
    const result = yield providerModel_1.providerFeedbackModel.create(Object.assign(Object.assign({}, payload), { userId: userId }));
    return result;
});
const myReviewDB = (query, providerId) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = yield user_model_1.UserModel.findById(providerId);
    if (!provider) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Provider not found.");
    }
    const userQuery = new queryBuilder_1.default(providerModel_1.providerFeedbackModel.find({ providerId: providerId }).populate({
        path: "userId",
        select: "name image          ",
    }), query).sort();
    const { totalData } = yield userQuery.paginate(providerModel_1.providerFeedbackModel.find({ providerId: providerId }));
    const data = yield userQuery.modelQuery.exec();
    const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = userQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, data, };
});
const topReviewsDB = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = yield user_model_1.UserModel.findById(providerId);
    if (!provider) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Provider not found.");
    }
    const reviews = yield providerModel_1.providerFeedbackModel.find({
        isFavourite: true,
        providerId: provider
    }).populate({
        path: "userId",
        select: "image",
    });
    return reviews;
});
const avarageReviewsDB = (providerId) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = yield user_model_1.UserModel.findById(providerId);
    if (!provider) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Provider not found.");
    }
    const allFeedback = yield providerModel_1.providerFeedbackModel.find({ providerId: providerId });
    const totalRating = allFeedback.reduce((acc, feedback) => acc + feedback.rating, 0);
    const averageRating = allFeedback.length > 0 ? totalRating / allFeedback.length : 0;
    const ratingCount = allFeedback.reduce((acc, feedback) => {
        acc[feedback.rating] = (acc[feedback.rating] || 0) + 1;
        return acc;
    }, {});
    const ratingResponse = {
        averageRating: averageRating.toFixed(1),
        ratingDistribution: {
            5: ratingCount[5] || 0,
            4: ratingCount[4] || 0,
            3: ratingCount[3] || 0,
            2: ratingCount[2] || 0,
            1: ratingCount[1] || 0,
        },
        totalReviews: allFeedback.length,
        // feedback: allFeedback.map((feedback) => ({
        //     rating: feedback.rating,
        //     details: feedback.details,
        // })),
    };
    return ratingResponse;
});
const IsfavouriteDB = (payload, providerId) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = yield user_model_1.UserModel.findById(providerId);
    if (!provider) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Provider not found.");
    }
    if (!payload.reviewId || payload.isFavourite === undefined) {
        throw new AppError_1.default(400, 'reviewId & isFavourite are required!');
    }
    const feedback = yield providerModel_1.providerFeedbackModel.findById(payload.reviewId);
    if (!feedback) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "feedback not found.");
    }
    if (payload.isFavourite === true) {
        const favouriteLimit = yield providerModel_1.providerFeedbackModel.find({
            providerId: providerId,
            isFavourite: true
        });
        if (favouriteLimit.length > 3) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "You cannot have more than three favorites.");
        }
    }
    const review = yield providerModel_1.providerFeedbackModel.findByIdAndUpdate(payload.reviewId, { isFavourite: payload.isFavourite }, { new: true });
    return review;
});
exports.providerFeedbackService = {
    createProviderFeedbackDB,
    myReviewDB,
    IsfavouriteDB,
    topReviewsDB,
    avarageReviewsDB
};
