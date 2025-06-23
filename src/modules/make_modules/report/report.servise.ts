import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { PaymentModel } from '../../basic_modules/payment/payment.model';
import BitProjectModel from '../BitProject/BitProject.model';
import { TReport } from "./report.interface";
import { reportModel } from './report.model';
import projectModel from '../addProject/project-model';

const createReportDB = async (payload: TReport, email: string) => {


    if (!payload) {
        throw new AppError(httpStatus.BAD_REQUEST, "Payload not found")
    }
    const bitProject = await BitProjectModel.findById(payload.bitProjectId)

    if (!bitProject) {
        throw new AppError(httpStatus.BAD_REQUEST, " bit project not found")
    }
    const isWallet = await PaymentModel.findOne({ customerEmail: email })
    if (!isWallet) {
        throw new AppError(httpStatus.PAYMENT_REQUIRED, 'Create a wallet account ')
    }
    if (isWallet.amount < 25) {
        throw new AppError(httpStatus.NOT_EXTENDED, 'Insufficient balance ')
    }
    const userWallet: any = await PaymentModel.findOne({ customerEmail: email })
    const adminWallet: any = await PaymentModel.findOne({ sessionId: 'admin123' })
    const adminWalleTransaction: any = await PaymentModel.findOne({ sessionId: 'admin1234' })
    userWallet.amount -= 25;
    adminWalleTransaction.amount -= 25;
    adminWallet.amount += 25;
    await userWallet.save();
    await adminWallet.save();
    await adminWalleTransaction.save()
    const result = await reportModel.create(payload)
    return result
}

const getReportAdminDB = async () => {
    try {
        const getContact: any[] = await reportModel.find().populate({
            path: "repoterId",
            select: "name email image",
        })
        return getContact
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        return [];
    }
}
const singleReportBD = async (id: string) => {
    const getReport: any = await reportModel.findById(id).populate("bitProjectId").populate({
        path: "repoterId",
        select: "name email image service postalCode city address",
    }).populate({
        path: "userId",
        select: "name email image service postalCode city address",
    });
    const projectImage: any = await projectModel.findById(getReport.bitProjectId.projectId)
    const reportData = {
        getReport, projectImage: projectImage.image
    }
    return reportData

}
export const reportService = {
    createReportDB,
    getReportAdminDB,
    singleReportBD
}



