"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = require("../modules/basic_modules/user/user.route");
const Terms_route_1 = require("../modules/basic_modules/Terms/Terms.route");
const About_route_1 = require("../modules/basic_modules/About/About.route");
const Privacy_route_1 = require("../modules/basic_modules/privacy/Privacy.route");
const feedback_route_1 = require("../modules/basic_modules/Feedback/feedback.route");
const notification_route_1 = require("../modules/basic_modules/notifications/notification.route");
const payment_route_1 = require("../modules/basic_modules/payment/payment.route");
const project_route_1 = require("../modules/make_modules/addProject/project-route");
const BitProject_route_1 = require("../modules/make_modules/BitProject/BitProject.route");
const providerFeedback_route_1 = require("../modules/make_modules/providerFeedback/providerFeedback.route");
const admin_route_1 = require("../modules/make_modules/admin/admin.route");
const withdraw_route_1 = require("../modules/make_modules/withdraw/withdraw.route");
const messages_route_1 = require("../modules/make_modules/messages/messages.route");
const catagory_route_1 = require("../modules/make_modules/addProject/projectCatagory/catagory.route");
const contact_route_1 = require("../modules/basic_modules/ContactUs/contact-route");
const Terms_route_2 = require("../modules/basic_modules/Terms copy/Terms.route");
const report__route_1 = require("../modules/make_modules/report/report. route");
const router = express_1.default.Router();
router.use("/api/v1/user", user_route_1.UserRoutes);
router.use("/api/v1/terms", Terms_route_1.TermsRoutes);
router.use("/api/v1/reportPolicy", Terms_route_2.ReportPolicyRoutes);
router.use("/api/v1/about", About_route_1.AboutRoutes);
router.use("/api/v1/privacy", Privacy_route_1.PrivacyRoutes);
router.use("/api/v1/notifications", notification_route_1.NotificationRoutes);
router.use("/api/v1/feedback", feedback_route_1.feedBackRoutes);
// make modules 
router.use("/api/v1/project", project_route_1.projectRoutes);
router.use("/api/v1/catagory", catagory_route_1.catagoryRoutes);
router.use("/api/v1/bit", BitProject_route_1.bitProjectRoutes);
router.use("/api/v1/payment", payment_route_1.paymentRoutes);
router.use("/api/v1/provider", providerFeedback_route_1.providerFeedRotes);
// admin routes
router.use("/api/v1/admin", admin_route_1.adminRoutes);
router.use("/api/v1/payByAdmin", withdraw_route_1.withDrawRoutes);
router.use("/api/v1/chat", messages_route_1.conversationRoutes);
// contact meases?
router.use("/api/v1/contact", contact_route_1.contactRoutes);
// report 
router.use("/api/v1/report", report__route_1.reportRoute);
// report 
exports.default = router;
