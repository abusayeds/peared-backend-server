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
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const withdraw_model_1 = require("./withdraw.model");
const payment_controller_1 = require("../../basic_modules/payment/payment.controller");
const user_model_1 = require("../../basic_modules/user/user.model");
const payment_model_1 = require("../../basic_modules/payment/payment.model");
const allWithWrawDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const allWithdraReq = yield withdraw_model_1.withdrawModel.find();
    return allWithdraReq;
});
const payByAdminDB = (withDrawId) => __awaiter(void 0, void 0, void 0, function* () {
    const withDraw = yield withdraw_model_1.withdrawModel.findById(withDrawId);
    if (!withDraw) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "No withdraw request found !");
    }
    const provider = yield user_model_1.UserModel.findById(withDraw.providerId);
    const accountInfo = yield payment_controller_1.stripe.accounts.retrieve(provider.accountId);
    if (!accountInfo.capabilities || accountInfo.capabilities.transfers !== 'active') {
        throw new AppError_1.default(http_status_1.default.PAYMENT_REQUIRED, "Get bank information from Provider");
    }
    const adminCommission = 10;
    let serviceProviderAmount = withDraw.amount - (withDraw.amount * adminCommission / 100);
    serviceProviderAmount = Math.round(serviceProviderAmount);
    const transfar = yield payment_controller_1.stripe.transfers.create({
        amount: serviceProviderAmount,
        currency: 'usd',
        destination: provider.accountId,
        description: 'Payment for completed project',
    });
    console.log(transfar);
    if (transfar) {
        const adminIncome = withDraw.amount - serviceProviderAmount;
        yield payment_model_1.PaymentModel.findOneAndUpdate({ sessionId: "admin123" }, {
            $inc: { amount: adminIncome },
        }, { new: true });
        yield payment_model_1.PaymentModel.findOneAndUpdate({ sessionId: "admin1234" }, {
            $inc: { amount: -withDraw.amount },
        }, { new: true });
        yield payment_model_1.PaymentModel.findOneAndUpdate({ customerEmail: provider.email }, {
            $inc: { amount: -withDraw.amount },
        }, { new: true });
    }
});
exports.withDarwService = {
    payByAdminDB,
    allWithWrawDB
};
