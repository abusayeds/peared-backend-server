import httpStatus from "http-status";
import queryBuilder from "../../../builder/queryBuilder";
import AppError from "../../../errors/AppError";
import { UserModel } from "../../basic_modules/user/user.model";
import BitProjectModel from "../BitProject/BitProject.model";
import { conversationModel, messageModel } from "./messages.model";

const peerKey = (userId: any, providerId: any) =>
  `${String(userId)}:${String(providerId)}`;

const unreadCountFor = async (
  conversationId: any,
  authUserId: string,
  role: string,
  conversation: any
) => {
  const lastRead =
    role === "provider"
      ? conversation.providerLastReadAt
      : conversation.userLastReadAt;

  const filter: any = {
    conversationId,
    senderId: { $ne: String(authUserId) },
  };
  if (lastRead) {
    filter.createdAt = { $gt: lastRead };
  }
  return messageModel.countDocuments(filter);
};

const relatedProjectsForPair = async (userId: any, providerId: any) => {
  const bits = await BitProjectModel.find({
    providerId,
  })
    .populate({
      path: "projectId",
      match: { userId },
      select:
        "projectName projectCategory isDirected isApprove isComplete createdAt image street city postCode workDetails",
    })
    .sort({ createdAt: -1 })
    .lean();

  return bits
    .filter(
      (b: any) =>
        b.projectId &&
        b.isComplete !== "finished" &&
        !b.projectId.isComplete
    )
    .map((b: any) => ({
      bitId: b._id,
      projectId: b.projectId._id,
      projectName: b.projectId.projectName,
      projectCategory: b.projectId.projectCategory,
      image: b.projectId.image,
      street: b.projectId.street,
      city: b.projectId.city,
      postCode: b.projectId.postCode,
      workDetails: b.projectId.workDetails || b.Workdetails,
      isDirected: !!b.projectId.isDirected,
      isApprove: !!b.projectId.isApprove,
      projectComplete: !!b.projectId.isComplete,
      status: b.isComplete,
      price: b.price,
      serviceTime: b.serviceTime,
      startTime: b.startTime,
    }));
};

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

/** Always one thread per user↔provider. */
const startDirectDB = async (userId: string, providerId: string) => {
  if (String(userId) === String(providerId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot message yourself");
  }

  const provider = await UserModel.findById(providerId);
  if (!provider || provider.role !== "provider" || !provider.isApproved) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider not found");
  }

  let conversation = await conversationModel.findOne({ userId, providerId });

  if (!conversation) {
    try {
      conversation = await conversationModel.create({
        userId,
        providerId,
        type: "direct",
        projectId: null,
        userLastReadAt: new Date(),
        providerLastReadAt: null,
      });
    } catch (err: any) {
      // race on unique index — fetch existing
      conversation = await conversationModel.findOne({ userId, providerId });
      if (!conversation) throw err;
    }
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

  // Deduplicate: one row per peer pair (keep most recently updated)
  const unique = new Map<string, any>();
  for (const c of conversations) {
    const uid = c.userId?._id || c.userId;
    const pid = c.providerId?._id || c.providerId;
    const key = peerKey(uid, pid);
    if (!unique.has(key)) unique.set(key, c);
  }

  const list = Array.from(unique.values());

  const withPreview = await Promise.all(
    list.map(async (c: any) => {
      const uid = c.userId?._id || c.userId;
      const pid = c.providerId?._id || c.providerId;

      const lastMessage = await messageModel
        .findOne({ conversationId: c._id })
        .sort({ createdAt: -1 })
        .lean();

      const unreadCount = await unreadCountFor(c._id, authUserId, role, c);
      const projects = await relatedProjectsForPair(uid, pid);

      const pendingOffers = await BitProjectModel.find({
        providerId: pid,
        isComplete: "pending",
      })
        .populate({
          path: "projectId",
          match: { userId: uid },
          select: "projectName projectCategory isDirected",
        })
        .sort({ createdAt: -1 })
        .lean();

      return {
        ...c,
        lastMessage,
        unreadCount,
        projects,
        pendingOffers: pendingOffers.filter((o: any) => o.projectId),
      };
    })
  );

  return withPreview;
};

const getConversationMetaDB = async (
  conversationId: string,
  authUserId: string,
  role: string
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

  const projects = await relatedProjectsForPair(uid, pid);

  const pendingOffers = await BitProjectModel.find({
    providerId: pid,
    isComplete: "pending",
  })
    .populate({
      path: "projectId",
      match: { userId: uid },
      select:
        "projectName projectCategory workDetails street city postCode isDirected userId sourceConversationId",
    })
    .sort({ createdAt: -1 })
    .lean();

  const unreadCount = await unreadCountFor(
    conversation._id,
    authUserId,
    role,
    conversation
  );

  return {
    conversation,
    projects,
    pendingOffers: pendingOffers.filter((o: any) => o.projectId),
    pendingOffer: pendingOffers.find((o: any) => o.projectId) || null,
    unreadCount,
  };
};

const markReadDB = async (
  conversationId: string,
  authUserId: string,
  role: string
) => {
  const conversation: any = await conversationModel.findById(conversationId);
  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");
  }
  const uid = String(conversation.userId);
  const pid = String(conversation.providerId);
  if (String(authUserId) !== uid && String(authUserId) !== pid) {
    throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  }

  const now = new Date();
  if (role === "provider") {
    conversation.providerLastReadAt = now;
  } else {
    conversation.userLastReadAt = now;
  }
  await conversation.save();

  const totalUnread = await getTotalUnreadDB(authUserId, role);
  return { conversationId, totalUnread, readAt: now };
};

const getTotalUnreadDB = async (authUserId: string, role: string) => {
  const filter =
    role === "provider"
      ? { providerId: authUserId }
      : { userId: authUserId };

  const conversations = await conversationModel.find(filter).lean();
  // Deduplicate pairs
  const unique = new Map<string, any>();
  for (const c of conversations) {
    const key = peerKey(c.userId, c.providerId);
    if (!unique.has(key)) unique.set(key, c);
  }

  let total = 0;
  for (const c of unique.values()) {
    total += await unreadCountFor(c._id, authUserId, role, c);
  }
  return total;
};

/** Find-or-create the single thread for a pair (used by bid accept). */
const ensureThreadDB = async (userId: string, providerId: string) => {
  let conversation = await conversationModel.findOne({ userId, providerId });
  if (!conversation) {
    try {
      conversation = await conversationModel.create({
        userId,
        providerId,
        type: "direct",
        projectId: null,
      });
    } catch {
      conversation = await conversationModel.findOne({ userId, providerId });
    }
  }
  return conversation;
};

export const messageservice = {
  getConversationDB,
  startDirectDB,
  getInboxDB,
  getConversationMetaDB,
  markReadDB,
  getTotalUnreadDB,
  ensureThreadDB,
};
