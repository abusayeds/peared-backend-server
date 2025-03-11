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
exports.checkPaymentStatusFromStripe = void 0;
const config_1 = require("../../../config");
const stripe = require("stripe")(config_1.STRIPE_SECRET_KEY);
const checkPaymentStatusFromStripe = (sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = yield stripe.checkout.sessions.retrieve(sessionId);
        switch (session.payment_status) {
            case "paid":
                return "completed";
            case "open":
                return "pending";
            case "expired":
                return "expired";
            case "canceled":
                return "canceled";
            case "requires_payment_method":
                return "requires_payment_method";
            default:
                return "unknown";
        }
    }
    catch (error) {
        console.error(" Error fetching payment status from Stripe:", error);
        return "error";
    }
});
exports.checkPaymentStatusFromStripe = checkPaymentStatusFromStripe;
