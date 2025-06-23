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
exports.projectController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const decoded_1 = require("../../../middlewares/decoded");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const socket_1 = require("../../../utils/socket");
const payment_controller_1 = require("../../basic_modules/payment/payment.controller");
const payment_model_1 = require("../../basic_modules/payment/payment.model");
const user_model_1 = require("../../basic_modules/user/user.model");
const project_service_1 = require("./project-service");
const createProject = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const userId = decoded.user._id;
    const email = decoded.user.email;
    const name = decoded.user.name;
    const userWallet = yield payment_model_1.PaymentModel.findOne({ customerEmail: email });
    const adminWallet = yield payment_model_1.PaymentModel.findOne({ sessionId: 'admin123' });
    const projectData = Object.assign(Object.assign({}, req.body), { userId });
    const project = yield project_service_1.projectService.createProjectDB(projectData, email);
    const admin = yield user_model_1.UserModel.findOne({ role: "admin" });
    (0, socket_1.sendNotification)({
        userId: admin._id,
        message: `${name} create a project !`,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Please pay $1 to proceed',
        data: project
    });
    userWallet.amount -= 1;
    adminWallet.amount += 1;
    yield userWallet.save();
    yield adminWallet.save();
    yield payment_model_1.paymentHistoryModel.create({
        historyName: `${project.projectName} project created.`,
        email: email,
        admin: 'admin123',
        balance: 1,
        paymentType: "withdraw"
    });
}));
const myProject = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const userId = decoded.user._id;
    const result = yield project_service_1.projectService.myProjectDB(userId, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: ' recived my project ',
        data: result
    });
}));
const bitProject = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const result = yield project_service_1.projectService.bitProjectDB(projectId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: ' recived my bit project ',
        data: result
    });
}));
const boostProject = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const email = decoded.user.email;
    const project = yield project_service_1.projectService.boostProjctDB(projectId, email);
    const userWallet = yield payment_model_1.PaymentModel.findOne({ customerEmail: email });
    const adminWallet = yield payment_model_1.PaymentModel.findOne({ sessionId: 'admin123' });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Project successfully boost !',
        data: null
    });
    userWallet.amount -= 1;
    adminWallet.amount += 1;
    yield userWallet.save();
    yield adminWallet.save();
    yield payment_model_1.paymentHistoryModel.create({
        historyName: `${project.projectName} project Boosted.`,
        email: email,
        admin: 'admin123',
        balance: 1,
        paymentType: "withdraw"
    });
}));
const allProject = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = yield (0, decoded_1.tokenDecoded)(req, res);
    const allProject = yield project_service_1.projectService.allProjectDB(req.query, decoded.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: ' recived all Project ',
        data: allProject
    });
}));
const singleProject = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const { projectId } = req.params;
    const allProject = yield project_service_1.projectService.singleProjectDB(projectId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: ' Get Single  Project ',
        data: allProject
    });
}));
const updateProject = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const allProject = yield project_service_1.projectService.updateProjectDB(req.body, projectId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Project update successfully ! ',
        data: allProject
    });
}));
exports.projectController = {
    createProject,
    myProject,
    bitProject,
    boostProject,
    allProject,
    singleProject,
    updateProject
};
