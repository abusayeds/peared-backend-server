import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { tokenDecoded } from "../../../middlewares/decoded";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { emitProjectEvent, sendNotification } from "../../../utils/socket";
import { paymentController } from "../../basic_modules/payment/payment.controller";
import {
  paymentHistoryModel,
  PaymentModel,
} from "../../basic_modules/payment/payment.model";
import { UserModel } from "../../basic_modules/user/user.model";
import queryBuilder from "../../../builder/queryBuilder";
import { searchProject } from "./project-constant";
import projectModel from "./project-model";
import { projectService } from "./project-service";

const createProject = catchAsync(async (req, res) => {
  const { decoded }: any = await tokenDecoded(req, res);
  const userId = decoded.user._id;
  const email = decoded.user.email;
  const name = decoded.user.name;
  const userWallet: any = await PaymentModel.findOne({ customerEmail: email });
  const adminWallet: any = await PaymentModel.findOne({
    sessionId: "admin123",
  });
  const projectData = { ...req.body, userId };
  const project = await projectService.createProjectDB(projectData, email);
  const admin = await UserModel.findOne({ role: "admin" });
  sendNotification({
    userId: admin._id,
    message: `${name} create a project !`,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Please pay $1 to proceed",
    data: project,
  });
  userWallet.amount -= 1;
  adminWallet.amount += 1;
  await userWallet.save();
  await adminWallet.save();
  await paymentHistoryModel.create({
    historyName: `${project.projectName} project created.`,
    email: email,
    admin: "admin123",
    balance: 1,
    paymentType: "withdraw",
  });
});

const myProject = catchAsync(async (req, res) => {
  const { decoded }: any = await tokenDecoded(req, res);
  const userId = decoded.user._id;
  const result = await projectService.myProjectDB(userId, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: " recived my project ",
    data: result,
  });
});

const bitProject = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const result = await projectService.bitProjectDB(projectId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: " recived my bit project ",
    data: result,
  });
});

const boostProject = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const { decoded }: any = await tokenDecoded(req, res);
  const email = decoded.user.email;
  const project = await projectService.boostProjctDB(projectId, email);
  const userWallet: any = await PaymentModel.findOne({ customerEmail: email });
  const adminWallet: any = await PaymentModel.findOne({
    sessionId: "admin123",
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project successfully boost !",
    data: null,
  });
  userWallet.amount -= 1;
  adminWallet.amount += 1;
  await userWallet.save();
  await adminWallet.save();
  await paymentHistoryModel.create({
    historyName: `${project.projectName} project Boosted.`,
    email: email,
    admin: "admin123",
    balance: 1,
    paymentType: "withdraw",
  });
});

const allProject = catchAsync(async (req, res) => {
  const marketplaceFilter = {
    payment: true,
    isDirected: { $ne: true },
  };
  const projectQuery = new queryBuilder(
    projectModel.find(marketplaceFilter),
    req.query
  )
    .search(searchProject)
    .filter()
    .sort();
  const { totalData } = await projectQuery.paginate(
    projectModel.find(marketplaceFilter)
  );
  const project = await projectQuery.modelQuery.exec();
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
    message: " recived all Project ",
    data: { pagination, project },
  });
});

const singleProject = catchAsync(async (req, res) => {
  const { decoded }: any = await tokenDecoded(req, res);
  const userId = decoded.user._id;
  const email = decoded.user.email;
  const provider = await UserModel.findById(userId);
  if (!provider) {
    throw new AppError(httpStatus.NOT_FOUND, "provider not found");
  }
  if (provider.role === "provider" && provider.verifiedSkillset === false) {
    const providerData = {
      name: provider.name,
      providerId: provider._id,
      email: provider.email,
      role: "provider",
    };
    const { url } = await paymentController.createCheckoutSession(
      email,
      30,
      providerData
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Please pay $30 ",
      data: url,
    });
    return;
  }
  const { projectId } = req.params;
  const allProject = await projectService.singleProjectDB(projectId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: " Get Single  Project ",
    data: allProject,
  });
});

const updateProject = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const allProject = await projectService.updateProjectDB(req.body, projectId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project update successfully ! ",
    data: allProject,
  });
});

const createDirectedOffer = catchAsync(async (req, res) => {
  const { decoded }: any = await tokenDecoded(req, res);
  const userId = decoded.user._id;
  const name = decoded.user.name;
  const {
    providerId,
    conversationId,
    projectName,
    projectCategory,
    street,
    city,
    postCode,
    locationType,
    time,
    workDetails,
    price,
    serviceTime,
    backgroundCertificate,
    oshaCertificate,
  } = req.body;

  if (!providerId || !projectName || !projectCategory || !price || !serviceTime) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Missing required offer fields"
    );
  }

  const image =
    (req as any).file?.path ||
    (req as any).file?.location ||
    req.body.image ||
    "directed-offer";

  const result = await projectService.createDirectedOfferDB({
    userId,
    providerId,
    conversationId,
    projectName,
    projectCategory,
    street: street || "TBD",
    city: city || "TBD",
    postCode: postCode || "00000",
    locationType: locationType || "Home",
    time: time || "Not sure - still planning",
    workDetails: workDetails || projectName,
    image,
    backgroundCertificate,
    oshaCertificate,
    price: Number(price),
    serviceTime: Number(serviceTime),
  });

  emitProjectEvent(providerId, "bid:created", {
    bid: result.bit,
    projectId: result.project._id,
    providerId,
    conversationId,
    notificationTitle: "New direct offer",
    notificationMessage: `${name} sent you an offer for $${price}`,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Offer sent to provider",
    data: result,
  });
});

export const projectController = {
  createProject,
  myProject,
  bitProject,
  boostProject,
  allProject,
  singleProject,
  updateProject,
  createDirectedOffer,
};
