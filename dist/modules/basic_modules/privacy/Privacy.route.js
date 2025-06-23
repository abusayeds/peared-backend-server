"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../middlewares/auth");
const Privacy_controller_1 = require("./Privacy.controller");
const router = express_1.default.Router();
router.post("/create-privacy", (0, auth_1.authMiddleware)("admin"), Privacy_controller_1.createPrivacy);
router.get("/", Privacy_controller_1.getAllPrivacy);
router.post("/update-privacy", Privacy_controller_1.updatePrivacy);
router.get("/html-page", Privacy_controller_1.PrivacyHtmlPage);
exports.PrivacyRoutes = router;
