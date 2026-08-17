import express from "express";

import { authMiddleware } from "../../../middlewares/auth";
import { role } from "../../../utils/role";
import { messageController } from "./messages.controller";

const router = express.Router();

router.get(
  "/inbox",
  authMiddleware(role.user, role.provider),
  messageController.getInbox
);
router.get(
  "/unread-count",
  authMiddleware(role.user, role.provider),
  messageController.getUnreadCount
);
router.post(
  "/start-direct",
  authMiddleware(role.user),
  messageController.startDirect
);
router.post(
  "/mark-read/:conversationId",
  authMiddleware(role.user, role.provider),
  messageController.markRead
);
router.get(
  "/meta/:conversationId",
  authMiddleware(role.user, role.provider),
  messageController.getConversationMeta
);
router.get(
  "/conversation/:conversationId",
  authMiddleware(role.user, role.provider),
  messageController.getConversation
);
router.post(
  "/block/:userId",
  authMiddleware(role.user, role.provider),
  messageController.blockUser
);
router.delete(
  "/block/:userId",
  authMiddleware(role.user, role.provider),
  messageController.unblockUser
);

export const conversationRoutes = router;
