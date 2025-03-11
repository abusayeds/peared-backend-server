"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../middlewares/auth");
const role_1 = require("../../../utils/role");
const messages_controller_1 = require("./messages.controller");
const router = express_1.default.Router();
router.get("/conversation/:conversationId", (0, auth_1.authMiddleware)(role_1.role.user, role_1.role.provider), messages_controller_1.messageController.getConversation);
exports.conversationRoutes = router;
