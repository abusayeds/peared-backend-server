"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentHistoryModel = exports.PaymentModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
    },
    projectId: {
        type: String,
        required: false,
    },
    customerEmail: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        default: "usd",
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    },
}, {
    timestamps: true,
});
exports.PaymentModel = mongoose_1.default.models.Payment || mongoose_1.default.model("Payment", paymentSchema);
const paymentHistorySchema = new mongoose_1.default.Schema({
    historyName: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
    admin: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    paymentType: {
        type: String,
        enum: ["withdraw", "deposit"],
        required: true,
    },
}, {
    timestamps: true,
});
exports.paymentHistoryModel = mongoose_1.default.model("PaymentHistory", paymentHistorySchema);
