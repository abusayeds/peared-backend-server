import { STRIPE_SECRET_KEY } from "../../../config";

const stripe = require("stripe")(STRIPE_SECRET_KEY);

 export const checkPaymentStatusFromStripe = async (sessionId: string) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

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
    } catch (error) {
        console.error(" Error fetching payment status from Stripe:", error);
        return "error";
    }
};