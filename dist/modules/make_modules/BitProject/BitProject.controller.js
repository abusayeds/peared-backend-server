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
exports.bitController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const decoded_1 = require("../../../middlewares/decoded");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const socket_1 = require("../../../utils/socket");
const payment_controller_1 = require("../../basic_modules/payment/payment.controller");
const user_model_1 = require("../../basic_modules/user/user.model");
const project_model_1 = __importDefault(require("../addProject/project-model"));
const messages_model_1 = require("../messages/messages.model");
const BitProject_model_1 = __importDefault(require("./BitProject.model"));
const BitProject_service_1 = require("./BitProject.service");
const createBitProject = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const userId = decoded.user._id;
    const email = decoded.user.email;
    const provider = yield user_model_1.UserModel.findById(userId);
    if (!provider) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'provider not found');
    }
    if (provider.role === "provider" && provider.verifiedSkillset === false) {
        const providerData = { name: provider.name, providerId: provider._id, email: provider.email, role: 'provider', };
        const { url } = yield payment_controller_1.paymentController.createCheckoutSession(email, 30, providerData);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Please pay $30 ",
            data: url
        });
        return;
    }
    const existbits = yield BitProject_model_1.default.findOne({
        projectId: req.body.projectId,
        providerId: userId
    });
    if (existbits) {
        throw new AppError_1.default(400, "You have already bitten.");
    }
    const payload = Object.assign(Object.assign({}, req.body), { providerId: userId });
    const result = yield BitProject_service_1.bitProjectService.createBitProject(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Project bit added ! ',
        data: result
    });
    const project = yield project_model_1.default.findById(result.projectId);
    const user = yield user_model_1.UserModel.findById(project.userId);
    yield (0, socket_1.sendNotification)({
        userId: user._id,
        message: `${provider.name} bit your project !`,
    });
}));
const singleProject = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bitProjectId } = req.params;
    const result = yield BitProject_service_1.bitProjectService.singleProjectDB(bitProjectId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: ' recived  bit project details ',
        data: result
    });
}));
const confirmProject = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const result = yield BitProject_service_1.bitProjectService.confirmProjectDB(projectId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: ' recived  project details ',
        data: result
    });
}));
const bitProjectApproved = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bitProjectId } = req.params;
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const email = decoded.user.email;
    const userId = decoded.user._id;
    const name = decoded.user.name;
    const bitProjectApproved = yield BitProject_service_1.bitProjectService.bitProjectApprovedDB(bitProjectId, email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `project successfullly Approved `,
        data: bitProjectApproved
    });
    if (bitProjectApproved) {
        const conversation = new messages_model_1.conversationModel({
            projectId: bitProjectApproved.projectId._id,
            providerId: bitProjectApproved.providerId,
            userId: userId
        });
        yield conversation.save();
    }
    yield (0, socket_1.sendNotification)({
        userId: bitProjectApproved.providerId,
        message: `${name} accept your Bits !`,
    });
}));
const currentProjects = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const providerId = decoded.user._id;
    const currentBitProjects = yield BitProject_service_1.bitProjectService.currentProjectsDB(providerId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Current Projects Retrieve `,
        data: currentBitProjects
    });
}));
const pendingsBits = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const providerId = decoded.user._id;
    const pendingBitProjects = yield BitProject_service_1.bitProjectService.pendingsBitsDB(providerId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Pendings Bits Retrieve  `,
        data: pendingBitProjects
    });
}));
const ProjectOkByProvider = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const { bitProjectId } = req.params;
    const providerId = decoded.user._id;
    const projectOk = yield BitProject_service_1.bitProjectService.ProjectOkByProviderDB(bitProjectId, providerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Proposal sent `,
        data: projectOk
    });
}));
const ProjectOkByUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const { bitProjectId } = req.params;
    const userId = decoded.user._id;
    const email = decoded.user.email;
    const projectOk = yield BitProject_service_1.bitProjectService.ProjectOkByUserDB(bitProjectId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Project completed correctly`,
        data: projectOk
    });
}));
const ProjectNotOk = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const { bitProjectId } = req.params;
    const userId = decoded.user._id;
    const projectOk = yield BitProject_service_1.bitProjectService.ProjectNotOkDB(bitProjectId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Project Rejected`,
        data: projectOk
    });
}));
exports.bitController = {
    createBitProject,
    singleProject,
    bitProjectApproved,
    currentProjects,
    pendingsBits,
    ProjectOkByProvider,
    ProjectOkByUser,
    confirmProject,
    ProjectNotOk
};
