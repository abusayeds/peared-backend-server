
import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { tokenDecoded } from "../../../middlewares/decoded";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { sendNotification } from "../../../utils/socket";
import { paymentController } from "../../basic_modules/payment/payment.controller";
import { paymentHistoryModel, PaymentModel } from "../../basic_modules/payment/payment.model";
import { UserModel } from "../../basic_modules/user/user.model";
import { projectService } from "./project-service";
import queryBuilder from "../../../builder/queryBuilder";
import projectModel from "./project-model";
import { searchProject } from "./project-constant";

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
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        const projectQuery = new queryBuilder(projectModel.find({ payment: true, }), req.query).search(searchProject).filter().sort()
        const { totalData } = await projectQuery.paginate(projectModel.find({ payment: true, }))
        const project = await projectQuery.modelQuery.exec()
        const currentPage = Number(req.query?.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const pagination = projectQuery.calculatePagination({
            totalData,
            currentPage,
            limit,
        });
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: ' recived all Project ',
            data: { pagination, project }
        });
        return
    }
    const { decoded }: any = await tokenDecoded(req, res)
    const allProject = await projectService.allProjectDB(req.query, decoded.user)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ' recived all Project ',
        data: allProject
    });
});
const singleProject = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const userId = decoded.user._id;
    const email = decoded.user.email;
    const provider = await UserModel.findById(userId)
    if (!provider) {
        throw new AppError(httpStatus.NOT_FOUND, 'provider not found')
    }
    if (provider.role === "provider" && provider.verifiedSkillset === false) {
        const providerData = { name: provider.name, providerId: provider._id, email: provider.email, role: 'provider', }
        const { url } = await paymentController.createCheckoutSession(email, 30, providerData);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Please pay $30 ",
            data: url
        });
        return
    }
    const { projectId } = req.params
    const allProject = await projectService.singleProjectDB(projectId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ' Get Single  Project ',
        data: allProject
    });
});
const updateProject = catchAsync(async (req, res) => {
    const { projectId } = req.params
    const allProject = await projectService.updateProjectDB(req.body, projectId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project update successfully ! ',
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
    updateProject

}