import httpStatus from "http-status"
import AppError from "../../../errors/AppError"
import { withdrawModel } from "./withdraw.model"
import { stripe } from "../../basic_modules/payment/payment.controller"
import { UserModel } from "../../basic_modules/user/user.model"
import { PaymentModel } from "../../basic_modules/payment/payment.model"

const allWithWrawDB = async () => {
    const allWithdraReq = await withdrawModel.find()
    return allWithdraReq
}
const payByAdminDB = async (withDrawId: string) => {
    const withDraw = await withdrawModel.findById(withDrawId)
    if (!withDraw) {
        throw new AppError(httpStatus.NOT_FOUND, "No withdraw request found !")
    }
    const provider = await UserModel.findById(withDraw.providerId)

    const accountInfo = await stripe.accounts.retrieve(provider.accountId);
    if (!accountInfo.capabilities || accountInfo.capabilities.transfers !== 'active') {
        throw new AppError(httpStatus.PAYMENT_REQUIRED, "Get bank information from Provider")
    }
    const adminCommission = 10;
    let serviceProviderAmount = withDraw.amount - (withDraw.amount * adminCommission / 100);


    serviceProviderAmount = Math.round(serviceProviderAmount);

    const transfar = await stripe.transfers.create({
        amount: serviceProviderAmount,
        currency: 'usd',
        destination: provider.accountId,
        description: 'Payment for completed project',
    });
    if (transfar) {
        const adminIncome = withDraw.amount - serviceProviderAmount
        await PaymentModel.findOneAndUpdate(
            { sessionId: "admin123" },
            {
                $inc: { amount: adminIncome },
            },
            { new: true }
        )
        await PaymentModel.findOneAndUpdate(
            { sessionId: "admin1234" },
            {
                $inc: { amount: -withDraw.amount },
            },
            { new: true }
        )
        await PaymentModel.findOneAndUpdate(
            { customerEmail: provider.email },
            {
                $inc: { amount: -withDraw.amount },
            },
            { new: true }
        )
    }
    console.log(transfar.amount);


}

export const withDarwService = {
    payByAdminDB,
    allWithWrawDB
}
