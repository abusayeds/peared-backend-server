"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../middlewares/auth");
const role_1 = require("../../../utils/role");
const admin_controller_1 = require("./admin.controller");
const router = express_1.default.Router();
router.get("/dashboard", (0, auth_1.authMiddleware)(role_1.role.admin), admin_controller_1.adminController.adminDashboard);
router.get("/income/:year", (0, auth_1.authMiddleware)(role_1.role.admin), admin_controller_1.adminController.adminIncome);
router.get("/transaction/:year", (0, auth_1.authMiddleware)(role_1.role.admin), admin_controller_1.adminController.adminTransaction);
exports.adminRoutes = router;
