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
exports.withDarwService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const queryBuilder_1 = __importDefault(require("../../../builder/queryBuilder"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const payment_controller_1 = require("../../basic_modules/payment/payment.controller");
const payment_model_1 = require("../../basic_modules/payment/payment.model");
const user_model_1 = require("../../basic_modules/user/user.model");
const withdraw_model_1 = require("./withdraw.model");
const allWithWrawDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const allWithdraReqQuery = new queryBuilder_1.default(withdraw_model_1.withdrawModel.find().populate({
        path: 'providerId',
        select: 'name email'
    }), query).sort();
    const { totalData } = yield allWithdraReqQuery.paginate(withdraw_model_1.withdrawModel.find());
    const data = yield allWithdraReqQuery.modelQuery.exec();
    const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = allWithdraReqQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, data, };
});
const payByAdminDB = (withDrawId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!withDrawId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid withdrawal request ID.");
    }
    const withDraw = yield withdraw_model_1.withdrawModel.findById(withDrawId);
    if (!withDraw) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "No withdraw request found!");
    }
    const provider = yield user_model_1.UserModel.findById(withDraw.providerId);
    if (!provider) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Provider not found.");
    }
    let accountInfo;
    try {
        accountInfo = yield payment_controller_1.stripe.accounts.retrieve(provider.accountId);
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to retrieve account information.");
    }
    if (!accountInfo.capabilities || accountInfo.capabilities.transfers !== 'active') {
        throw new AppError_1.default(http_status_1.default.PAYMENT_REQUIRED, "Get bank information from Provider.");
    }
    const adminCommission = 5;
    let serviceProviderAmount = withDraw.amount - (withDraw.amount * adminCommission / 100);
    serviceProviderAmount = Math.round(serviceProviderAmount);
    let transfar;
    try {
        transfar = yield payment_controller_1.stripe.transfers.create({
            amount: serviceProviderAmount,
            currency: 'usd',
            destination: provider.accountId,
            description: 'Payment for completed project',
        });
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Payment transfer failed.");
    }
    if (transfar.balance_transaction) {
        const adminIncome = withDraw.amount - serviceProviderAmount;
        try {
            yield payment_model_1.PaymentModel.findOneAndUpdate({ sessionId: "admin123" }, { $inc: { amount: adminIncome } }, { new: true });
            yield payment_model_1.PaymentModel.findOneAndUpdate({ sessionId: "admin1234" }, { $inc: { amount: -withDraw.amount } }, { new: true });
            yield withdraw_model_1.withdrawModel.findByIdAndDelete(withDrawId);
        }
        catch (error) {
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to update payment records.");
        }
    }
    return withDraw;
});
exports.withDarwService = {
    payByAdminDB,
    allWithWrawDB
};
