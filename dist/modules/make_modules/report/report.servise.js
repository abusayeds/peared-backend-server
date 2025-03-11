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
exports.reportService = void 0;
const report_model_1 = require("./report.model");
const payment_model_1 = require("../../basic_modules/payment/payment.model");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createReportDB = (payload, email) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload);
    if (!payload) {
        throw new AppError_1.default(http_status_1.default.BAD_GATEWAY, "Payload not found");
    }
    const isWallet = yield payment_model_1.PaymentModel.findOne({ customerEmail: email });
    if (!isWallet) {
        throw new AppError_1.default(http_status_1.default.PAYMENT_REQUIRED, 'Create a wallet account ');
    }
    if (isWallet.amount < 25) {
        throw new AppError_1.default(http_status_1.default.NOT_EXTENDED, 'Insufficient balance ');
    }
    const userWallet = yield payment_model_1.PaymentModel.findOne({ customerEmail: email });
    const adminWallet = yield payment_model_1.PaymentModel.findOne({ sessionId: 'admin123' });
    const adminWalleTransaction = yield payment_model_1.PaymentModel.findOne({ sessionId: 'admin1234' });
    userWallet.amount -= 25;
    adminWalleTransaction.amount -= 25;
    adminWallet.amount += 25;
    yield userWallet.save();
    yield adminWallet.save();
    yield adminWalleTransaction.save();
    const result = yield report_model_1.reportModel.create(payload);
    return result;
});
const getReportAdminDB = () => __awaiter(void 0, void 0, void 0, function* () {
});
exports.reportService = {
    createReportDB,
    getReportAdminDB
};
