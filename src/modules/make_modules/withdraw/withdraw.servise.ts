
import httpStatus from "http-status"
import queryBuilder from "../../../builder/queryBuilder"
import AppError from "../../../errors/AppError"
import { stripe } from "../../basic_modules/payment/payment.controller"
import { PaymentModel } from "../../basic_modules/payment/payment.model"
import { UserModel } from "../../basic_modules/user/user.model"
import { withdrawModel } from "./withdraw.model"

const allWithWrawDB = async (query: Record<string, unknown>) => {
    const allWithdraReqQuery = new queryBuilder(withdrawModel.find().populate({
        path: 'providerId',
        select: 'name email'
    }), query).sort()
    const { totalData } = await allWithdraReqQuery.paginate(withdrawModel.find())
    const data = await allWithdraReqQuery.modelQuery.exec()
    const currentPage = Number(query?.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = allWithdraReqQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, data, };
}


const payByAdminDB = async (withDrawId: string) => {
    if (!withDrawId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid withdrawal request ID.");
    }
    const withDraw = await withdrawModel.findById(withDrawId);
    if (!withDraw) {
        throw new AppError(httpStatus.NOT_FOUND, "No withdraw request found!");
    }
    const provider = await UserModel.findById(withDraw.providerId);
    if (!provider) {
        throw new AppError(httpStatus.NOT_FOUND, "Provider not found.");
    }
    let accountInfo;
    try {
        accountInfo = await stripe.accounts.retrieve(provider.accountId);
    } catch (error) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve account information.");
    }
    if (!accountInfo.capabilities || accountInfo.capabilities.transfers !== 'active') {
        throw new AppError(httpStatus.PAYMENT_REQUIRED, "Get bank information from Provider.");
    }
    const adminCommission = 10;
    let serviceProviderAmount = withDraw.amount - (withDraw.amount * adminCommission / 100);
    serviceProviderAmount = Math.round(serviceProviderAmount);
    let transfar;
    try {
        transfar = await stripe.transfers.create({
            amount: serviceProviderAmount,
            currency: 'usd',
            destination: provider.accountId,
            description: 'Payment for completed project',
        });
    } catch (error) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Payment transfer failed.");
    }
    if (transfar.balance_transaction) {
        const adminIncome = withDraw.amount - serviceProviderAmount;
        try {
            await PaymentModel.findOneAndUpdate(
                { sessionId: "admin123" },
                { $inc: { amount: adminIncome } },
                { new: true }
            );
            await PaymentModel.findOneAndUpdate(
                { sessionId: "admin1234" },
                { $inc: { amount: -withDraw.amount } },
                { new: true }
            );
            await withdrawModel.findByIdAndDelete(withDrawId);
        } catch (error) {
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update payment records.");
        }
    }
    return withDraw;
};



export const withDarwService = {
    payByAdminDB,
    allWithWrawDB
}
