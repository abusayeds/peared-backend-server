"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../middlewares/auth");
const contact_controller_1 = require("./contact-controller");
const role_1 = require("../../../utils/role");
const router = express_1.default.Router();
router.post("/create-contact", (0, auth_1.authMiddleware)(role_1.role.user), contact_controller_1.contactController.createContact);
router.get("/all-message", (0, auth_1.authMiddleware)(role_1.role.admin), contact_controller_1.contactController.getContactMessage);
router.get("/user-message/:userId", (0, auth_1.authMiddleware)(role_1.role.admin), contact_controller_1.contactController.getContactUserMessage);
exports.contactRoutes = router;
