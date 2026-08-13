import httpStatus from "http-status";
import queryBuilder from "../../../builder/queryBuilder";
import AppError from "../../../errors/AppError";
import { PaymentModel } from "../../basic_modules/payment/payment.model";
import { IUser } from "../../basic_modules/user/user.interface";
import { UserModel } from "../../basic_modules/user/user.model";
import BitProjectModel from "../BitProject/BitProject.model";
import { conversationModel, messageModel } from "../messages/messages.model";
import { providerFeedbackModel } from "../providerFeedback/providerModel";
import { searchProject } from "./project-constant";
import { TProject } from "./project-interface";
import projectModel from "./project-model";

const createProjectDB = async (payload: Partial<TProject> | Record<string, unknown>, email: string) => {
  const isWallet = await PaymentModel.findOne({ customerEmail: email });
  if (!isWallet) {
    throw new AppError(httpStatus.PAYMENT_REQUIRED, "Create a wallet account ");
  }
  if (isWallet.amount < 1) {
    throw new AppError(httpStatus.NOT_EXTENDED, "Insufficient balance ");
  }
  const project = await projectModel.create(payload);
  return project;
};

const myProjectDB = async (userId: string, query: Record<string, unknown>) => {
  const projectQuery = new queryBuilder(
    projectModel.find({ userId: userId }),
    query
  )
    .sort()
    .search(searchProject)
    .filter();
  const { totalData } = await projectQuery.paginate(
    projectModel.find({ userId: userId })
  );
  const projects = await projectQuery.modelQuery.exec();
  const expiredProjects = projects.filter((project) => {
    return (
      project.expiredDate &&
      new Date(project.expiredDate.toString()).getTime() < new Date().getTime()
    );
  });
  const updatePayment = expiredProjects.map((project) => {
    if (project.expiredDate) {
      project.payment = false;
      return project.save();
    }
    return project;
  });
  await Promise.all(updatePayment);
  const currentPage = Number(query?.page) || 1;
  const limit = Number(query.limit) || 10;
  const pagination = projectQuery.calculatePagination({
    totalData,
    currentPage,
    limit,
  });

  return { pagination, projects };
};

const bitProjectDB = async (projectId: string) => {
  const project = await projectModel.findById(projectId);
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "This project was not found!");
  }

  const bitProjects = await BitProjectModel.find({ projectId });
  if (bitProjects.length === 0) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No BitProjects found for this project!"
    );
  }
  const bitProjectsWithRatings = await Promise.all(
    bitProjects.map(async (bitProject) => {
      const allFeedback = await providerFeedbackModel.find({
        providerId: bitProject.providerId._id,
      });
      let totalRating = 0;
      let totalFeedbackCount = 0;
      if (allFeedback.length > 0) {
        totalRating = allFeedback.reduce(
          (acc, feedback) => acc + feedback.rating,
          0
        );
        totalFeedbackCount = allFeedback.length;
      }

      const averageRating =
        totalFeedbackCount > 0
          ? (totalRating / totalFeedbackCount).toFixed(2)
          : "0.00";
      return {
        ...bitProject.toObject(),
        totalRating,
        averageRating,
      };
    })
  );

  return bitProjectsWithRatings;
};

const boostProjctDB = async (projectId: string, email: string) => {
  const project: any = await projectModel.findById(projectId);
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found !");
  }
  if (project.payment === true) {
    throw new AppError(httpStatus.NOT_FOUND, "Allrade Boosted");
  }
  const isWallet = await PaymentModel.findOne({ customerEmail: email });
  if (isWallet!.amount < 1) {
    throw new AppError(httpStatus.NOT_EXTENDED, "Insufficient balance ");
  }
  await PaymentModel.findOneAndUpdate(
    { sessionId: "admin1234" },
    {
      $inc: { amount: -1 },
    },
    { new: true }
  );
  project.payment = true;
  project.expiredDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await project.save();
  return project;
};

const allProjectDB = async (query: Record<string, unknown>, user: IUser) => {
  const marketplaceFilter: any = {
    payment: true,
    isDirected: { $ne: true },
    $or: [{ targetProviderId: null }, { targetProviderId: { $exists: false } }],
  };
  if (user.oshaCertificat && user.backgroundCertificat) {
    marketplaceFilter.oshaCertificate = true;
    marketplaceFilter.backgroundCertificate = true;
  } else if (user.oshaCertificat) {
    marketplaceFilter.oshaCertificate = true;
  } else if (user.backgroundCertificat) {
    marketplaceFilter.backgroundCertificate = true;
  }

  const projectQuery = new queryBuilder(
    projectModel.find(marketplaceFilter),
    query
  )
    .search(searchProject)
    .filter()
    .sort();
  const { totalData } = await projectQuery.paginate(
    projectModel.find(marketplaceFilter)
  );
  const project = await projectQuery.modelQuery.exec();
  const currentPage = Number(query?.page) || 1;
  const limit = Number(query.limit) || 10;
  const pagination = projectQuery.calculatePagination({
    totalData,
    currentPage,
    limit,
  });
  return { pagination, project };
};

const singleProjectDB = async (projectId: string) => {
  const SingleProject = await projectModel.findById(projectId);
  return SingleProject;
};

const updateProjectDB = async (payload: TProject, projectId: string) => {
  const updatedProject = await projectModel.findByIdAndUpdate(
    projectId,
    payload,
    { new: true }
  );
  return updatedProject;
};

const createDirectedOfferDB = async (payload: {
  userId: string;
  providerId: string;
  conversationId?: string;
  projectName: string;
  projectCategory: string;
  street: string;
  city: string;
  postCode: string;
  locationType: "Home" | "Business";
  time: TProject["time"];
  workDetails: string;
  image?: string;
  backgroundCertificate?: boolean;
  oshaCertificate?: boolean;
  price: number;
  serviceTime: number;
}) => {
  const provider = await UserModel.findById(payload.providerId);
  if (!provider || provider.role !== "provider" || !provider.isApproved) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider not found");
  }

  if (payload.conversationId) {
    const conversation: any = await conversationModel.findById(
      payload.conversationId
    );
    if (
      !conversation ||
      String(conversation.userId) !== String(payload.userId) ||
      String(conversation.providerId) !== String(payload.providerId)
    ) {
      throw new AppError(httpStatus.FORBIDDEN, "Invalid conversation");
    }
  }

  const project = await projectModel.create({
    userId: payload.userId,
    street: payload.street,
    city: payload.city,
    postCode: payload.postCode,
    locationType: payload.locationType,
    time: payload.time,
    priceRange: `$${payload.price}`,
    image: payload.image || "directed-offer",
    projectName: payload.projectName,
    projectCategory: payload.projectCategory,
    workDetails: payload.workDetails,
    backgroundCertificate: !!payload.backgroundCertificate,
    oshaCertificate: !!payload.oshaCertificate,
    payment: false,
    isDirected: true,
    targetProviderId: payload.providerId,
    sourceConversationId: payload.conversationId || null,
  });

  const bit = await BitProjectModel.create({
    projectId: project._id,
    providerId: payload.providerId,
    price: payload.price,
    serviceTime: payload.serviceTime,
    Workdetails: payload.workDetails,
    isComplete: "pending",
  });

  if (payload.conversationId) {
    await messageModel.create({
      conversationId: payload.conversationId,
      senderId: String(payload.userId),
      messageText: `📨 Offer sent: "${payload.projectName}" — $${payload.price} / ${payload.serviceTime} days. Waiting for provider to accept.`,
    });
    await conversationModel.findByIdAndUpdate(payload.conversationId, {
      updatedAt: new Date(),
    });
  }

  return { project, bit };
};

export const projectService = {
  createProjectDB,
  myProjectDB,
  bitProjectDB,
  boostProjctDB,
  allProjectDB,
  singleProjectDB,
  updateProjectDB,
  createDirectedOfferDB,
};
