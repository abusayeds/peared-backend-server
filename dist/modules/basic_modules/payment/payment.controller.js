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
exports.paymentController = exports.stripe = void 0;
const http_status_1 = __importDefault(require("http-status"));
const config_1 = require("../../../config");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const decoded_1 = require("../../../middlewares/decoded");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const user_model_1 = require("../user/user.model");
const payment_service_1 = require("./payment.service");
exports.stripe = require("stripe")(config_1.STRIPE_SECRET_KEY);
const createCheckoutSession = (customerEmail, amount, projectData) => __awaiter(void 0, void 0, void 0, function* () {
    if (!customerEmail) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "customerEmail is requred !");
    }
    if (!amount) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "amount is requred !");
    }
    const session = yield exports.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [{
                price_data: {
                    currency: "usd",
                    unit_amount: amount * 100,
                    product_data: { name: "Project Payment" },
                },
                quantity: 1,
            }],
        customer_email: customerEmail,
        success_url: `https://maggy-client-sayed-server.sarv.live/paymentSuccess`,
        cancel_url: `https://maggy-client-sayed-server.sarv.live/payment-cancel`,
        metadata: {
            customerEmail,
            amount: amount,
            projectData: JSON.stringify(projectData) || null
        },
    });
    return { url: session.url, sessionId: session.id };
});
const webhookController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        const webhookSecret = config_1.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error("Webhook Secret Key Missing!");
        }
        event = exports.stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        yield payment_service_1.webhookService.processWebhookEvent(event);
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    res.json({ received: true });
});
const addBalance = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "amount is required ");
    }
    const { decoded, } = yield (0, decoded_1.tokenDecoded)(req, res);
    const email = decoded.user.email;
    const user = yield user_model_1.UserModel.findOne({ email: email });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User Not Found ! ");
    }
    const { url } = yield createCheckoutSession(email, amount, user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: " Please add your balance ",
        data: url
    });
}));
const myWallat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const email = decoded.user.email;
    const result = yield payment_service_1.webhookService.myWallatDB(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: ' recived my wallat',
        data: result
    });
}));
const paymentHistory = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const email = decoded.user.email;
    const role = decoded.user.role;
    const paymentHistory = yield payment_service_1.webhookService.paymentHistoryDB(email, req.query, role);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: ' recived my payment history',
        data: paymentHistory
    });
}));
const providerWithdraw = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const email = decoded.user.email;
    if (req.body.amount === undefined ||
        req.body.amount <= 0 ||
        !Number.isInteger(req.body.amount)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Amount is required, must be greater than 0, and should be an integer.');
    }
    const data = yield payment_service_1.webhookService.providerWithdrawDB(req.body, email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: ' Writhdraw request sent ! ',
        data: data
    });
}));
exports.paymentController = {
    createCheckoutSession,
    webhookController,
    addBalance,
    myWallat,
    paymentHistory,
    providerWithdraw
};
