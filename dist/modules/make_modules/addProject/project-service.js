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
exports.projectService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const queryBuilder_1 = __importDefault(require("../../../builder/queryBuilder"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const payment_model_1 = require("../../basic_modules/payment/payment.model");
const BitProject_model_1 = __importDefault(require("../BitProject/BitProject.model"));
const providerModel_1 = require("../providerFeedback/providerModel");
const project_constant_1 = require("./project-constant");
const project_model_1 = __importDefault(require("./project-model"));
const createProjectDB = (payload, email) => __awaiter(void 0, void 0, void 0, function* () {
    // if (!payload.oshaCertificate && !payload.backgroundCertificate) {
    //     throw new AppError(
    //         httpStatus.BAD_REQUEST,
    //         'At least one certificate (OSHA or Background) is required.'
    //     );
    // }
    const isWallet = yield payment_model_1.PaymentModel.findOne({ customerEmail: email });
    if (!isWallet) {
        throw new AppError_1.default(http_status_1.default.PAYMENT_REQUIRED, 'Create a wallet account ');
    }
    if (isWallet.amount < 1) {
        throw new AppError_1.default(http_status_1.default.NOT_EXTENDED, 'Insufficient balance ');
    }
    yield payment_model_1.PaymentModel.findOneAndUpdate({ sessionId: "admin1234" }, {
        $inc: { amount: -1 },
    }, { new: true });
    const project = yield project_model_1.default.create(payload);
    return project;
});
const myProjectDB = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const projectQuery = new queryBuilder_1.default(project_model_1.default.find({ userId: userId }), query).sort().search(project_constant_1.searchProject).filter();
    const { totalData } = yield projectQuery.paginate(project_model_1.default.find({ userId: userId }));
    const projects = yield projectQuery.modelQuery.exec();
    // const projects: TProject[] = await projectModel.find({ userId: userId });
    const expiredProjects = projects.filter(project => {
        return project.expiredDate && new Date(project.expiredDate.toString()).getTime() < new Date().getTime();
    });
    const updatePayment = expiredProjects.map(project => {
        if (project.expiredDate) {
            project.payment = false;
            return project.save();
        }
        return project;
    });
    yield Promise.all(updatePayment);
    const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
    const limit = Number(query.limit) || 10;
    const pagination = projectQuery.calculatePagination({
        totalData,
        currentPage,
        limit,
    });
    return { pagination, projects };
});
const bitProjectDB = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    const project = yield project_model_1.default.findById(projectId);
    if (!project) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This project was not found!');
    }
    const bitProjects = yield BitProject_model_1.default.find({ projectId });
    if (bitProjects.length === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No BitProjects found for this project!');
    }
    const bitProjectsWithRatings = yield Promise.all(bitProjects.map((bitProject) => __awaiter(void 0, void 0, void 0, function* () {
        const allFeedback = yield providerModel_1.providerFeedbackModel.find({ providerId: bitProject.providerId._id });
        let totalRating = 0;
        let totalFeedbackCount = 0;
        if (allFeedback.length > 0) {
            totalRating = allFeedback.reduce((acc, feedback) => acc + feedback.rating, 0);
            totalFeedbackCount = allFeedback.length;
        }
        const averageRating = totalFeedbackCount > 0 ? (totalRating / totalFeedbackCount).toFixed(2) : '0.00';
        return Object.assign(Object.assign({}, bitProject.toObject()), { totalRating,
            averageRating });
    })));
    return bitProjectsWithRatings;
});
const boostProjctDB = (projectId, email) => __awaiter(void 0, void 0, void 0, function* () {
    const project = yield project_model_1.default.findById(projectId);
    if (!project) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Project not found !');
    }
    if (project.payment === true) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Allrade Boosted');
    }
    const isWallet = yield payment_model_1.PaymentModel.findOne({ customerEmail: email });
    if (isWallet.amount < 1) {
        throw new AppError_1.default(http_status_1.default.NOT_EXTENDED, 'Insufficient balance ');
    }
    yield payment_model_1.PaymentModel.findOneAndUpdate({ sessionId: "admin1234" }, {
        $inc: { amount: -1 },
    }, { new: true });
    project.payment = true;
    project.expiredDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    yield project.save();
    return project;
});
const allProjectDB = (query, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (user.oshaCertificat && user.backgroundCertificat) {
        const projectQuery = new queryBuilder_1.default(project_model_1.default.find({ payment: true, oshaCertificate: true, backgroundCertificate: true }), query).search(project_constant_1.searchProject).filter().sort();
        const { totalData } = yield projectQuery.paginate(project_model_1.default.find({ payment: true, oshaCertificate: true, backgroundCertificate: true }));
        const project = yield projectQuery.modelQuery.exec();
        const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
        const limit = Number(query.limit) || 10;
        const pagination = projectQuery.calculatePagination({
            totalData,
            currentPage,
            limit,
        });
        return { pagination, project };
    }
    else if (user.oshaCertificat) {
        const projectQuery = new queryBuilder_1.default(project_model_1.default.find({ payment: true, oshaCertificate: true, }), query).search(project_constant_1.searchProject).filter().sort();
        const { totalData } = yield projectQuery.paginate(project_model_1.default.find({ payment: true, oshaCertificate: true, }));
        const project = yield projectQuery.modelQuery.exec();
        const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
        const limit = Number(query.limit) || 10;
        const pagination = projectQuery.calculatePagination({
            totalData,
            currentPage,
            limit,
        });
        return { pagination, project };
    }
    else if (user.backgroundCertificat) {
        const projectQuery = new queryBuilder_1.default(project_model_1.default.find({ payment: true, backgroundCertificate: true }), query).search(project_constant_1.searchProject).filter().sort();
        const { totalData } = yield projectQuery.paginate(project_model_1.default.find({ payment: true, backgroundCertificate: true }));
        const project = yield projectQuery.modelQuery.exec();
        const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
        const limit = Number(query.limit) || 10;
        const pagination = projectQuery.calculatePagination({
            totalData,
            currentPage,
            limit,
        });
        return { pagination, project };
    }
    else {
        const projectQuery = new queryBuilder_1.default(project_model_1.default.find({ payment: true, }), query).search(project_constant_1.searchProject).filter().sort();
        const { totalData } = yield projectQuery.paginate(project_model_1.default.find({ payment: true, }));
        const project = yield projectQuery.modelQuery.exec();
        const currentPage = Number(query === null || query === void 0 ? void 0 : query.page) || 1;
        const limit = Number(query.limit) || 10;
        const pagination = projectQuery.calculatePagination({
            totalData,
            currentPage,
            limit,
        });
        return { pagination, project };
    }
});
const singleProjectDB = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    const SingleProject = yield project_model_1.default.findById(projectId);
    return SingleProject;
});
const updateProjectDB = (payload, projectId) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedProject = yield project_model_1.default.findByIdAndUpdate(projectId, payload, { new: true });
    return updatedProject;
});
exports.projectService = {
    createProjectDB,
    myProjectDB,
    bitProjectDB,
    boostProjctDB,
    allProjectDB,
    singleProjectDB,
    updateProjectDB
};
