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
exports.providerFeedbackController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const providerFeedback_service_1 = require("./providerFeedback.service");
const decoded_1 = require("../../../middlewares/decoded");
const createProviderFeedback = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const userId = decoded.user._id;
    const result = yield providerFeedback_service_1.providerFeedbackService.createProviderFeedbackDB(req.body, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'FeedBack successfully send !',
        data: result
    });
}));
const myReview = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const providerId = decoded.user._id;
    const rersult = yield providerFeedback_service_1.providerFeedbackService.myReviewDB(req.query, providerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "provider review list retrieved successfully",
        data: rersult
    });
}));
const topReviews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { providerId } = req.params;
    const rersult = yield providerFeedback_service_1.providerFeedbackService.topReviewsDB(providerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Top  reviews list retrieved successfully",
        data: rersult
    });
}));
const avarageReviews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const providerId = decoded.user._id;
    const rersult = yield providerFeedback_service_1.providerFeedbackService.avarageReviewsDB(providerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "avarage  reviews list retrieved successfully",
        data: rersult
    });
}));
const Isfavourite = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const providerId = decoded.user._id;
    const result = yield providerFeedback_service_1.providerFeedbackService.IsfavouriteDB(req.body, providerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `${result.isFavourite === true ? " Favourite successFully " : "UnFavourite !"}`,
        data: result
    });
}));
exports.providerFeedbackController = {
    createProviderFeedback,
    myReview,
    Isfavourite,
    topReviews,
    avarageReviews
};
