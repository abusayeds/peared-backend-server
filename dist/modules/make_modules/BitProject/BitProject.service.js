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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bitProjectService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const queryBuilder_1 = __importDefault(require("../../../builder/queryBuilder"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const payment_model_1 = require("../../basic_modules/payment/payment.model");
const user_model_1 = require("../../basic_modules/user/user.model");
const project_model_1 = __importDefault(require("../addProject/project-model"));
const messages_model_1 = require("../messages/messages.model");
const providerModel_1 = require("../providerFeedback/providerModel");
const BitProject_model_1 = __importDefault(require("./BitProject.model"));
const createBitProject = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isProject = yield project_model_1.default.findById(payload.projectId);
    if (!isProject) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Project not found ! ');
    }
    const result = yield BitProject_model_1.default.create(payload);
    return result;
});
const singleProjectDB = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    const bitProject = yield BitProject_model_1.default.findById(projectId).populate({
        path: 'providerId',
        select: 'name   _id ',
    }).populate({
        path: 'projectId',
        select: 'projectCategory _id',
    });
    if (!bitProject) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This project not found!');
    }
    const allFeedback = yield providerModel_1.providerFeedbackModel.find({ providerId: bitProject === null || bitProject === void 0 ? void 0 : bitProject.providerId._id });
    const totalRating = allFeedback.reduce((acc, feedback) => acc + feedback.rating, 0);
    const averageRating = allFeedback.length > 0 ? totalRating / allFeedback.length : 0;
    const ratingCount = allFeedback.reduce((acc, feedback) => {
        acc[feedback.rating] = (acc[feedback.rating] || 0) + 1;
        return acc;
    }, {});
    const ratingResponse = {
        providerId: bitProject.providerId._id,
        providerName: bitProject.providerId.name,
        projectType: bitProject.projectId.projectCategory,
        workdetails: bitProject.Workdetails,
        price: bitProject.price,
        serviceTime: bitProject.serviceTime,
        startDate: bitProject.startTime,
        certificate: bitProject.certificate,
        averageRating: averageRating.toFixed(1),
        ratingDistribution: {
            5: ratingCount[5] || 0,
            4: ratingCount[4] || 0,
            3: ratingCount[3] || 0,
            2: ratingCount[2] || 0,
            1: ratingCount[1] || 0,
        },
        totalReviews: allFeedback.length,
    };
    return ratingResponse;
});
const bitProjectApprovedDB = (bitProjectId, email) => __awaiter(void 0, void 0, void 0, function* () {
    const bitProject = yield BitProject_model_1.default.findById(bitProjectId).populate({
        path: "projectId",
        select: "projectName ",
    });
    if (!bitProject) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Project not found");
    }
    const isbit = yield BitProject_model_1.default.findOne({
        projectId: bitProject.projectId._id,
        isComplete: "running"
    });
    if (isbit) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "Project is already approved");
    }
    if ((bitProject === null || bitProject === void 0 ? void 0 : bitProject.isComplete) === 'running') {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "Project is already approved");
    }
    if (!bitProject) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "bit project not found ");
    }
    const isWallet = yield payment_model_1.PaymentModel.findOne({ customerEmail: email });
    const project = yield project_model_1.default.findById(bitProject.projectId._id);
    if (!isWallet) {
        throw new AppError_1.default(http_status_1.default.PAYMENT_REQUIRED, 'Create a wallet account ');
    }
    if (isWallet.amount < bitProject.price) {
        throw new AppError_1.default(http_status_1.default.NOT_EXTENDED, 'Insufficient balance ');
    }
    isWallet.amount -= bitProject.price;
    project.isApprove = true;
    bitProject.isComplete = 'running';
    yield project.save();
    yield bitProject.save();
    yield isWallet.save();
    yield payment_model_1.paymentHistoryModel.create({
        historyName: `${bitProject.projectId.projectName} confirm`,
        balance: bitProject.price,
        email: email,
        paymentType: "withdraw"
    });
    return bitProject;
});
const confirmProjectDB = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    const currentProjects = yield BitProject_model_1.default.findOne({
        projectId: projectId,
    }).populate({
        path: "projectId",
        select: "userId projectCategory projectName street city postCode image ",
    }).populate({
        path: "providerId",
        select: "name image isActive updatedAt",
    });
    const user = yield user_model_1.UserModel.findById(currentProjects.projectId.userId);
    const conversation = yield messages_model_1.conversationModel.findOne({
        projectId: projectId,
        providerId: currentProjects.providerId,
        userId: currentProjects.projectId.userId
    });
    return {
        currentProjects,
        conversationId: conversation._id,
        userName: user.name,
        userImage: user.image,
        isActive: user.isActive,
        updatedAt: user.updatedAt
    };
});
// const currentProjectsDB = async (providerId: string) => {
//     const currentProjects = await BitProjectModel.find({
//         isComplete: 'running',
//         providerId: providerId,
//     }).populate({
//         path: "projectId",
//         select: "projectCategory street postCode image",
//     })
//     return currentProjects
// }
// const pendingsBitsDB = async (providerId: string) => {
//     const pendingsBits = await BitProjectModel.find({
//         isComplete: 'pending',
//         providerId: providerId,
//     }).populate({
//         path: "projectId",
//         select: "projectCategory street postCode image ",
//     })
//     return pendingsBits
// }
const currentProjectsDB = (providerId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const ProjectsQuery = new queryBuilder_1.default(BitProject_model_1.default.find({ isComplete: 'running', providerId: providerId }), query);
    const { totalData } = yield ProjectsQuery.paginate(BitProject_model_1.default.find({ isComplete: 'running', providerId: providerId }));
    const currentProjects = yield ProjectsQuery.modelQuery.populate({
        path: "projectId",
        select: "projectCategory street postCode image",
    }).exec();
    const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = ProjectsQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, currentProjects };
});
const pendingsBitsDB = (providerId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const ProjectsQuery = new queryBuilder_1.default(BitProject_model_1.default.find({ isComplete: 'pending', providerId: providerId }), query);
    const { totalData } = yield ProjectsQuery.paginate(BitProject_model_1.default.find({ isComplete: 'pending', providerId: providerId }));
    const pendingsBits = yield ProjectsQuery.modelQuery.populate({
        path: "projectId",
        select: "projectCategory street postCode image",
    }).exec();
    const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = ProjectsQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, pendingsBits };
});
const ProjectOkByProviderDB = (bitProjectId, providerId) => __awaiter(void 0, void 0, void 0, function* () {
    const currentProjects = yield BitProject_model_1.default.findOne({
        _id: bitProjectId,
        providerId: providerId,
    });
    if (!currentProjects) {
        throw new AppError_1.default(http_status_1.default.NOT_EXTENDED, 'Project Not found ');
    }
    if (currentProjects.isComplete === 'complete') {
        throw new AppError_1.default(http_status_1.default.NOT_EXTENDED, ' Proposal alredy sent ');
    }
    currentProjects.isComplete = 'complete';
    yield currentProjects.save();
    return currentProjects;
});
const ProjectNotOkDB = (bitProjectId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const currentProjects = yield BitProject_model_1.default.findById(bitProjectId);
    if (!currentProjects) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Project not found');
    }
    const myProjects = yield project_model_1.default.findById(currentProjects.projectId);
    if (!myProjects || myProjects.userId.toString() !== userId) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Project not found');
    }
    currentProjects.isComplete = 'running';
    yield currentProjects.save();
    return null;
});
const ProjectOkByUserDB = (bitProjectId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const currentProjects = yield BitProject_model_1.default.findById(bitProjectId);
    if (!currentProjects) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Project not found');
    }
    if (currentProjects.isComplete !== 'complete') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'The project was not completed properly.');
    }
    const myProjects = yield project_model_1.default.findById(currentProjects.projectId);
    if (!myProjects || myProjects.userId.toString() !== userId) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Project not found');
    }
    // Update provider's wallet
    const provider = yield user_model_1.UserModel.findById(currentProjects.providerId);
    yield payment_model_1.PaymentModel.findOneAndUpdate({ customerEmail: provider.email }, {
        $inc: { amount: currentProjects.price },
    }, { new: true });
    myProjects.isComplete = true;
    yield myProjects.save();
});
exports.bitProjectService = {
    createBitProject,
    singleProjectDB,
    bitProjectApprovedDB,
    currentProjectsDB,
    pendingsBitsDB,
    ProjectOkByProviderDB,
    ProjectOkByUserDB,
    confirmProjectDB,
    ProjectNotOkDB
};
