"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const role_1 = require("../../../utils/role");
const auth_1 = require("../../../middlewares/auth");
const router = express_1.default.Router();
router.post('/', express_1.default.raw({ type: "application/json" }), payment_controller_1.paymentController.webhookController);
router.post('/add-balance', (0, auth_1.authMiddleware)(role_1.role.user, role_1.role.provider), payment_controller_1.paymentController.addBalance);
router.get("/my-wallat", (0, auth_1.authMiddleware)(role_1.role.user, role_1.role.provider), payment_controller_1.paymentController.myWallat);
router.get("/my-payment-history", (0, auth_1.authMiddleware)(role_1.role.user, role_1.role.provider, role_1.role.admin), payment_controller_1.paymentController.paymentHistory);
// withdraw rerquest 
router.post("/provider-withdraw", (0, auth_1.authMiddleware)(role_1.role.provider), payment_controller_1.paymentController.providerWithdraw);
router.post('/payByAdmin', (0, auth_1.authMiddleware)(role_1.role.provider));
exports.paymentRoutes = router;
