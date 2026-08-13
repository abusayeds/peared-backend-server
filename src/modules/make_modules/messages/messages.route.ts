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
router.post(
  "/start-direct",
  authMiddleware(role.user),
  messageController.startDirect
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

export const conversationRoutes = router;
