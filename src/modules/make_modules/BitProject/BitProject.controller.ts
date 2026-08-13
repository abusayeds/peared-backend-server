import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { tokenDecoded } from "../../../middlewares/decoded";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { emitProjectEvent, sendNotification } from "../../../utils/socket";
import { paymentController } from "../../basic_modules/payment/payment.controller";
import { UserModel } from "../../basic_modules/user/user.model";
import projectModel from "../addProject/project-model";
import { conversationModel } from "../messages/messages.model";
import BitProjectModel from "./BitProject.model";
import { bitProjectService } from "./BitProject.service";

const createBitProject = catchAsync(async (req, res) => {
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
    const ownerId = project?.userId?.toString?.() || project?.userId;
    emitProjectEvent(ownerId, "bid:created", {
        bid: result,
        projectId: result.projectId,
        providerId: userId,
        providerName: provider.name,
        notificationTitle: "New Bid",
        notificationMessage: `${provider.name} bit your project !`,
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

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `project successfullly Approved `,
        data: bitProjectApproved
    });

    let conversationId = null;
    if (bitProjectApproved) {
        const providerId = bitProjectApproved.providerId;
        const projectId = bitProjectApproved.projectId._id || bitProjectApproved.projectId;
        let conversation = await conversationModel.findOne({
            userId,
            providerId,
        });
        if (!conversation) {
            conversation = await conversationModel.create({
                projectId,
                providerId,
                userId,
                type: "direct",
            });
        } else {
            conversation.projectId = projectId;
            await conversation.save();
        }
        conversationId = conversation._id;
    }

    const providerId = bitProjectApproved?.providerId?.toString?.() || bitProjectApproved?.providerId;
    emitProjectEvent(providerId, "bid:approved", {
        bitProjectId,
        projectId: bitProjectApproved?.projectId?._id || bitProjectApproved?.projectId,
        conversationId,
        isComplete: "running",
        notificationTitle: "Bid Approved",
        notificationMessage: `${name} accept your Bits !`,
    });
    emitProjectEvent(userId, "bid:approved", {
        bitProjectId,
        projectId: bitProjectApproved?.projectId?._id || bitProjectApproved?.projectId,
        conversationId,
        isComplete: "running",
    });
});

const acceptOfferByProvider = catchAsync(async (req, res) => {
    const { bitProjectId } = req.params;
    const { decoded }: any = await tokenDecoded(req, res);
    const providerId = decoded.user._id;
    const name = decoded.user.name;
    const result = await bitProjectService.acceptOfferByProviderDB(
        bitProjectId,
        providerId
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Offer accepted",
        data: result,
    });

    emitProjectEvent(result.ownerId, "bid:approved", {
        bitProjectId,
        projectId: result.project._id,
        conversationId: result.conversationId,
        isComplete: "running",
        notificationTitle: "Offer accepted",
        notificationMessage: `${name} accepted your offer. Project is now active.`,
    });
    emitProjectEvent(providerId, "bid:approved", {
        bitProjectId,
        projectId: result.project._id,
        conversationId: result.conversationId,
        isComplete: "running",
    });
});

const currentProjects = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const providerId = decoded.user._id;
    const currentBitProjects = await bitProjectService.currentProjectsDB(providerId, req.query)
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
    const pendingBitProjects = await bitProjectService.pendingsBitsDB(providerId, req.query)
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
    const name = decoded.user.name;
    const projectOk = await bitProjectService.ProjectOkByProviderDB(bitProjectId, providerId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Proposal sent `,
        data: projectOk
    });

    const project: any = await projectModel.findById(projectOk.projectId);
    const ownerId = project?.userId?.toString?.() || project?.userId;
    emitProjectEvent(ownerId, "project:providerDone", {
        bitProjectId,
        projectId: projectOk.projectId,
        isComplete: "complete",
        notificationTitle: "Work Done Request",
        notificationMessage: `${name} marked the project as done. Please review.`,
    });
});

const ProjectOkByUser = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const { bitProjectId } = req.params
    const userId = decoded.user._id;
    const name = decoded.user.name;
    const bit = await BitProjectModel.findById(bitProjectId);
    const projectOk = await bitProjectService.ProjectOkByUserDB(bitProjectId, userId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Project completed correctly`,
        data: projectOk
    });

    const providerId = bit?.providerId ? String(bit.providerId) : undefined;
    emitProjectEvent(providerId, "project:userOk", {
        bitProjectId,
        projectId: bit?.projectId,
        isComplete: "finished",
        notificationTitle: "Project Accepted",
        notificationMessage: `${name} confirmed your work is done.`,
    });
});

const ProjectNotOk = catchAsync(async (req, res) => {
    const { decoded }: any = await tokenDecoded(req, res)
    const { bitProjectId } = req.params
    const userId = decoded.user._id;
    const name = decoded.user.name;
    const bit = await BitProjectModel.findById(bitProjectId);
    const projectOk = await bitProjectService.ProjectNotOkDB(bitProjectId, userId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Project Rejected`,
        data: projectOk
    });

    const providerId = bit?.providerId ? String(bit.providerId) : undefined;
    emitProjectEvent(providerId, "project:userNotOk", {
        bitProjectId,
        projectId: bit?.projectId,
        isComplete: "running",
        notificationTitle: "Work Not Accepted",
        notificationMessage: `${name} rejected the done request. Please continue working.`,
    });
});

export const bitController = {
    createBitProject,
    singleProject,
    bitProjectApproved,
    acceptOfferByProvider,
    currentProjects,
    pendingsBits,
    ProjectOkByProvider,
    ProjectOkByUser,
    confirmProject,
    ProjectNotOk
}
