"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedBackRoutes = void 0;
const express_1 = __importDefault(require("express"));
const feedback_controller_1 = require("./feedback.controller");
const auth_1 = require("../../../middlewares/auth");
const router = express_1.default.Router();
router.post("/give", (0, auth_1.authMiddleware)("user"), feedback_controller_1.giveFeedback);
router.get("/", (0, auth_1.authMiddleware)("admin"), feedback_controller_1.getFeedback);
exports.feedBackRoutes = router;
