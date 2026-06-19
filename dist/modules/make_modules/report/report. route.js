"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRoute = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../middlewares/auth");
const fileUploadNormal_1 = require("../../../middlewares/fileUploadNormal");
const role_1 = require("../../../utils/role");
const report_controller_1 = require("./report.controller");
const router = express_1.default.Router();
router.post("/create-report", (0, auth_1.authMiddleware)(role_1.role.user, role_1.role.provider), ...(0, fileUploadNormal_1.uploadSingle)("image"), report_controller_1.reportController.createReport);
router.get("/get-report-admin", (0, auth_1.authMiddleware)(role_1.role.admin), report_controller_1.reportController.getReportAdmin);
router.get("/single-report/:id", (0, auth_1.authMiddleware)(role_1.role.admin), report_controller_1.reportController.singleReport);
exports.reportRoute = router;
