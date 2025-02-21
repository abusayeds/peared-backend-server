import express from "express";
import { UserRoutes } from "../modules/basic_modules/user/user.route";
import { TermsRoutes } from "../modules/basic_modules/Terms/Terms.route";
import { AboutRoutes } from "../modules/basic_modules/About/About.route";
import { PrivacyRoutes } from "../modules/basic_modules/privacy/Privacy.route";
import { feedBackRoutes } from "../modules/basic_modules/Feedback/feedback.route";
import { NotificationRoutes } from "../modules/basic_modules/notifications/notification.route";
import { paymentRoutes } from "../modules/basic_modules/payment/payment.route";
import { projectRoutes } from "../modules/make_modules/addProject/project-route";
import { bitProjectRoutes } from "../modules/make_modules/BitProject/BitProject.route";
import { providerFeedRotes } from "../modules/make_modules/providerFeedback/providerFeedback.route";
import { adminRoutes } from "../modules/make_modules/admin/admin.route";
import { withDrawRoutes } from "../modules/make_modules/withdraw/withdraw.route";
import { conversationRoutes } from "../modules/make_modules/messages/messages.route";


const router = express.Router();

router.use("/api/v1/user", UserRoutes);
router.use("/api/v1/terms", TermsRoutes);
router.use("/api/v1/about", AboutRoutes);
router.use("/api/v1/privacy", PrivacyRoutes);
router.use("/api/v1/notification", NotificationRoutes);
router.use("/api/v1/feedback", feedBackRoutes);
// make modules 
router.use("/api/v1/project", projectRoutes);
router.use("/api/v1/bit", bitProjectRoutes);
router.use("/api/v1/payment", paymentRoutes);
router.use("/api/v1/provider", providerFeedRotes);
// admin routes
router.use("/api/v1/admin", adminRoutes);
router.use("/api/v1/payByAdmin", withDrawRoutes);
router.use("/api/v1/chat", conversationRoutes);
export default router;
