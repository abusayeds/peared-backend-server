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
exports.seedSuperAdmin = void 0;
const payment_model_1 = require("../modules/basic_modules/payment/payment.model");
const user_model_1 = require("../modules/basic_modules/user/user.model");
const admin = {
    name: "MD Admin",
    email: "admin@gmail.com",
    password: "1qazxsw2",
    role: "admin",
    isDeleted: false,
};
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    const isSuperAdminExists = yield user_model_1.UserModel.findOne({ email: admin.email });
    const isSuperAdminPaymentExists = yield payment_model_1.PaymentModel.findOne({ customerEmail: admin.email });
    if (!isSuperAdminPaymentExists) {
        yield payment_model_1.PaymentModel.create({
            sessionId: "admin123",
            projectId: "income",
            customerEmail: admin.email,
            amount: 0,
            currency: "usd",
            paymentStatus: "pending"
        });
        yield payment_model_1.PaymentModel.create({
            sessionId: "admin1234",
            projectId: "transaction",
            customerEmail: admin.email,
            amount: 0,
            currency: "usd",
            paymentStatus: "pending"
        });
    }
    if (!isSuperAdminExists) {
        yield user_model_1.UserModel.create(admin);
    }
});
exports.seedSuperAdmin = seedSuperAdmin;
exports.default = exports.seedSuperAdmin;
