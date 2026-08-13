import httpStatus from "http-status";
import { tokenDecoded } from "../../../middlewares/decoded";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { emitProjectEvent } from "../../../utils/socket";
import { UserModel } from "../../basic_modules/user/user.model";
import { messageservice } from "./messages.service";

const getConversation = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const result = await messageservice.getConversationDB(
    conversationId,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: " Retrieved all message successfully",
    data: result,
  });
});

const startDirect = catchAsync(async (req, res) => {
  const { decoded }: any = await tokenDecoded(req, res);
  const userId = decoded.user._id;
  const { providerId } = req.body;
  const conversation = await messageservice.startDirectDB(userId, providerId);

  const provider = await UserModel.findById(providerId).select("name");
  emitProjectEvent(providerId, "chat:direct", {
    conversationId: conversation?._id,
    userId,
    notificationTitle: "New message request",
    notificationMessage: `${decoded.user.name} wants to chat with you`,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Conversation ready",
    data: conversation,
  });
});

const getInbox = catchAsync(async (req, res) => {
  const { decoded }: any = await tokenDecoded(req, res);
  const result = await messageservice.getInboxDB(
    decoded.user._id,
    decoded.user.role
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Inbox retrieved",
    data: result,
  });
});

const getConversationMeta = catchAsync(async (req, res) => {
  const { decoded }: any = await tokenDecoded(req, res);
  const { conversationId } = req.params;
  const result = await messageservice.getConversationMetaDB(
    conversationId,
    decoded.user._id
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Conversation meta retrieved",
    data: result,
  });
});

export const messageController = {
  getConversation,
  startDirect,
  getInbox,
  getConversationMeta,
};
