import httpStatus from "http-status";
import queryBuilder from "../../../builder/queryBuilder";
import AppError from "../../../errors/AppError";
import { UserModel } from "../../basic_modules/user/user.model";
import BitProjectModel from "../BitProject/BitProject.model";
import { conversationModel, messageModel } from "./messages.model";

const getConversationDB = async (
  conversationId: string,
  query: Record<string, unknown>
) => {
  const messageQuery = new queryBuilder(
    messageModel.find({ conversationId: conversationId }),
    query
  ).sort();
  const { totalData } = await messageQuery.paginate(
    messageModel.find({ conversationId: conversationId })
  );
  const data = await messageQuery.modelQuery.exec();
  const currentPage = Number(query?.page) || 1;
  const limit = Number(query.limit) || 10;
  const pagination = messageQuery.calculatePagination({
    totalData,
    currentPage,
    limit,
  });
  return { pagination, data };
};

const startDirectDB = async (userId: string, providerId: string) => {
  if (String(userId) === String(providerId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot message yourself");
  }

  const provider = await UserModel.findById(providerId);
  if (!provider || provider.role !== "provider" || !provider.isApproved) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider not found");
  }

  let conversation = await conversationModel.findOne({
    userId,
    providerId,
    type: "direct",
  });

  if (!conversation) {
    conversation = await conversationModel.create({
      userId,
      providerId,
      type: "direct",
      projectId: null,
    });
  }

  return conversationModel
    .findById(conversation._id)
    .populate({ path: "providerId", select: "name image isActive city" })
    .populate({ path: "userId", select: "name image isActive city" });
};

const getInboxDB = async (authUserId: string, role: string) => {
  const filter =
    role === "provider"
      ? { providerId: authUserId }
      : { userId: authUserId };

  const conversations = await conversationModel
    .find(filter)
    .sort({ updatedAt: -1 })
    .populate({ path: "providerId", select: "name image isActive city" })
    .populate({ path: "userId", select: "name image isActive city" })
    .lean();

  const withPreview = await Promise.all(
    conversations.map(async (c: any) => {
      const lastMessage = await messageModel
        .findOne({ conversationId: c._id })
        .sort({ createdAt: -1 })
        .lean();

      let pendingOffer = null;
      if (c.type === "direct" && !c.projectId) {
        pendingOffer = await BitProjectModel.findOne({
          providerId: c.providerId?._id || c.providerId,
          isComplete: "pending",
        })
          .populate({
            path: "projectId",
            match: {
              userId: c.userId?._id || c.userId,
              isDirected: true,
            },
            select: "projectName projectCategory targetProviderId isDirected",
          })
          .sort({ createdAt: -1 })
          .lean();

        if (pendingOffer && !pendingOffer.projectId) {
          pendingOffer = null;
        }
      }

      return {
        ...c,
        lastMessage,
        pendingOffer,
      };
    })
  );

  return withPreview;
};

const getConversationMetaDB = async (
  conversationId: string,
  authUserId: string
) => {
  const conversation: any = await conversationModel
    .findById(conversationId)
    .populate({ path: "providerId", select: "name image isActive city" })
    .populate({ path: "userId", select: "name image isActive city" });

  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");
  }

  const uid = String(conversation.userId?._id || conversation.userId);
  const pid = String(conversation.providerId?._id || conversation.providerId);
  if (String(authUserId) !== uid && String(authUserId) !== pid) {
    throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  }

  let pendingOffer = null;
  if (conversation.type === "direct" || conversation.projectId) {
    const offerQuery: any = {
      providerId: pid,
      isComplete: "pending",
    };
    if (conversation.projectId) {
      offerQuery.projectId = conversation.projectId;
    }
    pendingOffer = await BitProjectModel.findOne(offerQuery)
      .populate({
        path: "projectId",
        select:
          "projectName projectCategory workDetails street city postCode isDirected userId sourceConversationId",
      })
      .sort({ createdAt: -1 });

    if (
      pendingOffer?.projectId &&
      String((pendingOffer.projectId as any).userId) !== uid
    ) {
      if (!conversation.projectId) pendingOffer = null;
    }
  }

  return { conversation, pendingOffer };
};

export const messageservice = {
  getConversationDB,
  startDirectDB,
  getInboxDB,
  getConversationMetaDB,
};
