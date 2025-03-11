"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerFeedRotes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../middlewares/auth");
const role_1 = require("../../../utils/role");
const providerFeedback_controller_1 = require("./providerFeedback.controller");
const router = express_1.default.Router();
router.post("/create-provider-feedBack", (0, auth_1.authMiddleware)(role_1.role.user), providerFeedback_controller_1.providerFeedbackController.createProviderFeedback);
router.post("/is-favourite", (0, auth_1.authMiddleware)(role_1.role.provider), providerFeedback_controller_1.providerFeedbackController.Isfavourite);
router.get("/my-review", (0, auth_1.authMiddleware)(role_1.role.provider), providerFeedback_controller_1.providerFeedbackController.myReview);
router.get("/top-reviews/:providerId", (0, auth_1.authMiddleware)(role_1.role.user), providerFeedback_controller_1.providerFeedbackController.topReviews);
router.get("/avarage-reviews", (0, auth_1.authMiddleware)(role_1.role.provider), providerFeedback_controller_1.providerFeedbackController.avarageReviews);
exports.providerFeedRotes = router;
