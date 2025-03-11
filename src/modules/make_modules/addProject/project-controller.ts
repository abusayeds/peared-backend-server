
import httpStatus from "http-status";
import { tokenDecoded } from "../../../middlewares/decoded";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { sendNotification } from "../../../utils/socket";
import { paymentHistoryModel, PaymentModel } from "../../basic_modules/payment/payment.model";
import { UserModel } from "../../basic_modules/user/user.model";
import { projectService } from "./project-service";

const createProject = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const userId = decoded.user._id;
    const email = decoded.user.email;
    const name = decoded.user.name;
    const userWallet: any = await PaymentModel.findOne({ customerEmail: email })
    const adminWallet: any = await PaymentModel.findOne({ sessionId: 'admin123' })
    const projectData = { ...req.body, userId }
    const project = await projectService.createProjectDB(projectData, email)
    const admin = await UserModel.findOne({ role: "admin" });

    sendNotification({
        userId: admin._id,
        message: `${name} create a project !`,
    });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Please pay $1 to proceed',
        data: project
    });
    userWallet.amount -= 1;
    adminWallet.amount += 1;
    await userWallet.save();
    await adminWallet.save();
    await paymentHistoryModel.create({
        historyName: `${project.projectName} project created.`,
        email: email,
        admin: 'admin123',
        balance: 1,
        paymentType: "withdraw"
    })

});
const myProject = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const userId = decoded.user._id;
    const result = await projectService.myProjectDB(userId, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ' recived my project ',
        data: result
    });

});
const bitProject = catchAsync(async (req, res) => {
    const { projectId } = req.params
    const result = await projectService.bitProjectDB(projectId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ' recived my bit project ',
        data: result
    });
});
const boostProject = catchAsync(async (req, res) => {
    const { projectId } = req.params
    const { decoded }: any = await tokenDecoded(req, res)
    const email = decoded.user.email;
    const project = await projectService.boostProjctDB(projectId, email)
    const userWallet: any = await PaymentModel.findOne({ customerEmail: email })
    const adminWallet: any = await PaymentModel.findOne({ sessionId: 'admin123' })
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project successfully boost !',
        data: null
    });
    userWallet.amount -= 1;
    adminWallet.amount += 1;
    await userWallet.save();
    await adminWallet.save();
    await paymentHistoryModel.create({
        historyName: `${project.projectName} project Boosted.`,
        email: email,
        admin: 'admin123',
        balance: 1,
        paymentType: "withdraw"
    })
});

const allProject = catchAsync(async (req, res) => {
    const allProject = await projectService.allProjectDB(req.query)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ' recived all Project ',
        data: allProject
    });
});
const singleProject = catchAsync(async (req, res) => {
    const { projectId } = req.params
    const allProject = await projectService.singleProjectDB(projectId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ' Get Single  Project ',
        data: allProject
    });
});

export const projectController = {
    createProject,
    myProject,
    bitProject,
    boostProject,
    allProject,
    singleProject,

}