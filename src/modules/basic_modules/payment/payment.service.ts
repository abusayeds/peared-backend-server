import { UserModel } from './../user/user.model';

import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { withdrawModel } from "../../make_modules/withdraw/withdraw.model";
import { checkPaymentStatusFromStripe } from "./payment.constant";
import { stripe } from "./payment.controller";
import { paymentHistoryModel, PaymentModel } from "./payment.model";


const webhookHandlers: { [key: string]: Function[] } = {
    "checkout.session.completed": [processPayment,],
};

const processWebhookEvent = async (event: any) => {
    if (webhookHandlers[event.type]) {
        for (const handler of webhookHandlers[event.type]) {
            await handler(event);
        }
    }
};

async function processPayment(event: any) {
    const session = event.data.object;
    const payment_status = await checkPaymentStatusFromStripe(session.id);
    const projectData = JSON.parse(session.metadata.projectData);
    if (payment_status === 'completed') {
        const customerEmail = session.metadata.customerEmail;
        const isExistPayment = await PaymentModel.findOne({ customerEmail });
        if (projectData.role === 'provider') {
            await PaymentModel.create({
                sessionId: session.id,
                customerEmail: session.metadata.customerEmail,
                amount: 0,
                paymentStatus: "completed"
            });
            joinProvider(event)
        } else if (isExistPayment) {
            await PaymentModel.findOneAndUpdate(
                { customerEmail }, { $inc: { amount: session.metadata.amount }, }, { new: true }
            );
            await PaymentModel.findOneAndUpdate(
                { sessionId: "admin1234" }, { $inc: { amount: session.metadata.amount }, }, { new: true }
            )
        } else {
            await PaymentModel.create({
                sessionId: session.id,
                customerEmail: session.metadata.customerEmail,
                amount: session.metadata.amount,
                paymentStatus: "completed"
            });
            await PaymentModel.findOneAndUpdate(
                { sessionId: "admin1234" }, { $inc: { amount: session.metadata.amount }, }, { new: true }
            )
        }
        if (session.metadata.amount > 0) {
            await paymentHistoryModel.create({
                historyName: 'Add balance',
                email: session.metadata.customerEmail,
                admin: 'admin1234',
                balance: session.metadata.amount,
                paymentType: "deposit"
            })
        }
    }
}

async function joinProvider(event: any) {
    const session = event.data.object;
    const payment = await PaymentModel.findOne({ sessionId: session.id });
    if (!payment) {
        throw new AppError(400, ` Payment not found for session: ${session.id}`);
    }
    try {
        await PaymentModel.findOneAndUpdate(
            { sessionId: "admin123" },
            {
                $inc: { amount: session.metadata.amount },
            },
            { new: true }
        );
        const projectData = JSON.parse(session.metadata.projectData);
        await paymentHistoryModel.create({
            historyName: `${projectData.name}  provider pay `,
            email: projectData.email,
            admin: 'admin123',
            balance: session.metadata.amount,
            paymentType: "deposit"
        })
        await UserModel.findByIdAndUpdate(
            projectData.providerId, { verifiedSkillset: true }, { new: true }
        );
        // await userService.joinProviderDB(projectData);
    } catch (error) {
        throw new AppError(400, `${error}`);
    }
}


const myWallatDB = async (email: string) => {
    const wallet = await PaymentModel.findOne({ customerEmail: email })
    return wallet;
};
const paymentHistoryDB = async (email: string) => {
    const paymentHistory = await paymentHistoryModel.find({ email: email })

    return paymentHistory;
};




const providerWithdrawDB = async (payload: any, providerEmail: string) => {
    const wallet: any | null = await PaymentModel.findOne({
        customerEmail: providerEmail
    });
    if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, 'Provider wallet not found');
    }

    if (wallet.amount < payload.amount) {
        throw new AppError(httpStatus.NOT_EXTENDED, `Insufficient balance. Available balance: ${wallet.amount}`);
    }

    let provider = await UserModel.findOne({ email: providerEmail });
    if (!provider?.accountId) {
        const account = await stripe.accounts.create({
            type: 'express',
            email: provider?.email,
        });
        provider = await UserModel.findOneAndUpdate(
            { email: providerEmail },
            { accountId: account.id },
            { new: true }
        );
    }
    const accountInfo = await stripe.accounts.retrieve(provider.accountId);
    if (!accountInfo.capabilities || accountInfo.capabilities.transfers !== 'active') {

        const accountLink = await stripe.accountLinks.create({
            account: provider.accountId,
            refresh_url: `https://yourdomain.com/payment-cancel`,
            return_url: `https://yourdomain.com/payment-cancel`,
            type: 'account_onboarding',
        });
        return { url: accountLink.url };
    }

    await withdrawModel.create({
        providerId: provider._id,
        amount: payload.amount,
    })
    // await PaymentModel.findOneAndUpdate(
    //     { customerEmail }, { $inc: { amount: -payload.amount }, }, { new: true }
    // );
    wallet.amount -= payload.amount;
    await wallet.save()
    return { success: true };
};










export const webhookService = {
    processWebhookEvent,
    myWallatDB,
    paymentHistoryDB,
    providerWithdrawDB
};
