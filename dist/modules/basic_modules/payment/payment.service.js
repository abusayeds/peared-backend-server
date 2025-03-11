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
exports.webhookService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const withdraw_model_1 = require("../../make_modules/withdraw/withdraw.model");
const user_model_1 = require("../user/user.model");
const user_service_1 = require("../user/user.service");
const payment_constant_1 = require("./payment.constant");
const payment_controller_1 = require("./payment.controller");
const payment_model_1 = require("./payment.model");
const webhookHandlers = {
    "checkout.session.completed": [processPayment,],
};
const processWebhookEvent = (event) => __awaiter(void 0, void 0, void 0, function* () {
    if (webhookHandlers[event.type]) {
        for (const handler of webhookHandlers[event.type]) {
            yield handler(event);
        }
    }
});
function processPayment(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = event.data.object;
        const payment_status = yield (0, payment_constant_1.checkPaymentStatusFromStripe)(session.id);
        const projectData = JSON.parse(session.metadata.projectData);
        if (payment_status === 'completed') {
            const customerEmail = session.metadata.customerEmail;
            const isExistPayment = yield payment_model_1.PaymentModel.findOne({ customerEmail });
            if (isExistPayment) {
                yield payment_model_1.PaymentModel.findOneAndUpdate({ customerEmail }, { $inc: { amount: session.metadata.amount }, }, { new: true });
                yield payment_model_1.PaymentModel.findOneAndUpdate({ sessionId: "admin1234" }, { $inc: { amount: session.metadata.amount }, }, { new: true });
            }
            else if (projectData.role === 'provider') {
                yield payment_model_1.PaymentModel.create({
                    sessionId: session.id,
                    customerEmail: session.metadata.customerEmail,
                    amount: 0,
                    paymentStatus: "completed"
                });
                joinProvider(event);
            }
            else {
                yield payment_model_1.PaymentModel.create({
                    sessionId: session.id,
                    customerEmail: session.metadata.customerEmail,
                    amount: session.metadata.amount,
                    paymentStatus: "completed"
                });
                yield payment_model_1.PaymentModel.findOneAndUpdate({ sessionId: "admin1234" }, { $inc: { amount: session.metadata.amount }, }, { new: true });
            }
            if (session.metadata.amount > 0) {
                yield payment_model_1.paymentHistoryModel.create({
                    historyName: 'Add balance',
                    email: session.metadata.customerEmail,
                    admin: 'admin1234',
                    balance: session.metadata.amount,
                    paymentType: "deposit"
                });
            }
        }
    });
}
function joinProvider(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = event.data.object;
        const payment = yield payment_model_1.PaymentModel.findOne({ sessionId: session.id });
        if (!payment) {
            throw new AppError_1.default(400, ` Payment not found for session: ${session.id}`);
        }
        try {
            yield payment_model_1.PaymentModel.findOneAndUpdate({ sessionId: "admin123" }, {
                $inc: { amount: session.metadata.amount },
            }, { new: true });
            const projectData = JSON.parse(session.metadata.projectData);
            yield payment_model_1.paymentHistoryModel.create({
                historyName: `${projectData.name}  join`,
                email: projectData.email,
                admin: 'admin123',
                balance: session.metadata.amount,
                paymentType: "deposit"
            });
            yield user_service_1.userService.joinProviderDB(projectData);
        }
        catch (error) {
            throw new AppError_1.default(400, `${error}`);
        }
    });
}
const myWallatDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield payment_model_1.PaymentModel.findOne({ customerEmail: email });
    return wallet;
});
const paymentHistoryDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const paymentHistory = yield payment_model_1.paymentHistoryModel.find({ email: email });
    return paymentHistory;
});
const providerWithdrawDB = (payload, providerEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield payment_model_1.PaymentModel.findOne({
        customerEmail: providerEmail
    });
    if (!wallet) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Provider wallet not found');
    }
    if (wallet.amount < payload.amount) {
        throw new AppError_1.default(http_status_1.default.NOT_EXTENDED, `Insufficient balance. Available balance: ${wallet.amount}`);
    }
    let provider = yield user_model_1.UserModel.findOne({ email: providerEmail });
    if (!(provider === null || provider === void 0 ? void 0 : provider.accountId)) {
        const account = yield payment_controller_1.stripe.accounts.create({
            type: 'django',
            email: provider === null || provider === void 0 ? void 0 : provider.email,
        });
        provider = yield user_model_1.UserModel.findOneAndUpdate({ email: providerEmail }, { accountId: account.id }, { new: true });
    }
    const accountInfo = yield payment_controller_1.stripe.accounts.retrieve(provider.accountId);
    if (!accountInfo.capabilities || accountInfo.capabilities.transfers !== 'active') {
        const accountLink = yield payment_controller_1.stripe.accountLinks.create({
            account: provider.accountId,
            refresh_url: `https://yourdomain.com/payment-cancel`,
            return_url: `https://yourdomain.com/payment-cancel`,
            type: 'account_onboarding',
        });
        return { url: accountLink.url };
    }
    yield withdraw_model_1.withdrawModel.create({
        providerId: provider._id,
        amount: payload.amount,
    });
    return { success: true };
});
exports.webhookService = {
    processWebhookEvent,
    myWallatDB,
    paymentHistoryDB,
    providerWithdrawDB
};
