import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { tokenDecoded } from "../../../middlewares/decoded";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { sendNotification } from "../../../utils/socket";
import { UserModel } from "../../basic_modules/user/user.model";
import projectModel from "../addProject/project-model";
import { conversationModel } from "../messages/messages.model";
import BitProjectModel from "./BitProject.model";
import { bitProjectService } from "./BitProject.service";


const createBitProject = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const userId = decoded.user._id;
    const existbits = await BitProjectModel.findOne({
        projectId: req.body.projectId,
        providerId: userId
    })
    if (existbits) {
        throw new AppError(400, "You have already bitten.")
    }
    const payload = { ...req.body, providerId: userId }
    const result = await bitProjectService.createBitProject(payload)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project bit added ! ',
        data: result
    });
    const project: any = await projectModel.findById(result.projectId)
    const user = await UserModel.findById(project.userId)
    const provider = await UserModel.findById(result.providerId)
    await sendNotification({
        userId: user._id,
        message: `${provider.name} bit your project !`,
    });
});
const singleProject = catchAsync(async (req, res) => {
    const { bitProjectId } = req.params
    const result = await bitProjectService.singleProjectDB(bitProjectId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ' recived  bit project details ',
        data: result
    });
});
const confirmProject = catchAsync(async (req, res) => {
    const { projectId } = req.params
    const result = await bitProjectService.confirmProjectDB(projectId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ' recived  project details ',
        data: result
    });
});
const bitProjectApproved = catchAsync(async (req, res) => {
    const { bitProjectId } = req.params
    const { decoded }: any = await tokenDecoded(req, res)
    const email = decoded.user.email;
    const userId = decoded.user._id;
    const name = decoded.user.name;
    const bitProjectApproved = await bitProjectService.bitProjectApprovedDB(bitProjectId, email)
    console.log(bitProjectApproved);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `project successfullly Approved `,
        data: bitProjectApproved
    });
    if (bitProjectApproved) {
        const conversation = new conversationModel({
            projectId: bitProjectApproved.projectId._id,
            providerId: bitProjectApproved.providerId,
            userId: userId
        });
        await conversation.save();
    }
    await sendNotification({
        userId: bitProjectApproved.providerId,
        message: `${name} accept your Bits !`,
    });

});
const currentProjects = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const providerId = decoded.user._id;
    const currentBitProjects = await bitProjectService.currentProjectsDB(providerId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Current Projects Retrieve `,
        data: currentBitProjects
    });

});
const pendingsBits = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const providerId = decoded.user._id;
    const pendingBitProjects = await bitProjectService.pendingsBitsDB(providerId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Pendings Bits Retrieve  `,
        data: pendingBitProjects
    });

});
const ProjectOkByProvider = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const { bitProjectId } = req.params
    const providerId = decoded.user._id;
    const projectOk = await bitProjectService.ProjectOkByProviderDB(bitProjectId, providerId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Proposal sent `,
        data: projectOk
    });

});
const ProjectOkByUser = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const { bitProjectId } = req.params
    const userId = decoded.user._id;
    const email = decoded.user.email;
    const projectOk = await bitProjectService.ProjectOkByUserDB(bitProjectId, userId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Project completed correctly`,
        data: projectOk
    });

});
const ProjectNotOk = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const { bitProjectId } = req.params
    const userId = decoded.user._id;
    const projectOk = await bitProjectService.ProjectNotOkDB(bitProjectId, userId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Project Rejected`,
        data: projectOk
    });

});












export const bitController = {
    createBitProject,
    singleProject,
    bitProjectApproved,
    currentProjects,
    pendingsBits,
    ProjectOkByProvider,
    ProjectOkByUser,
    confirmProject,
    ProjectNotOk
}