"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bitProjectRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../middlewares/auth");
const role_1 = require("../../../utils/role");
const BitProject_controller_1 = require("./BitProject.controller");
const pdfFileUpload_1 = __importDefault(require("../../../middlewares/pdfFileUpload"));
const router = express_1.default.Router();
router.post("/create-bit-project", pdfFileUpload_1.default, (0, auth_1.authMiddleware)(role_1.role.provider), BitProject_controller_1.bitController.createBitProject);
router.get("/single-project/:bitProjectId", (0, auth_1.authMiddleware)(role_1.role.user), BitProject_controller_1.bitController.singleProject);
router.get("/confirm-project/:projectId", (0, auth_1.authMiddleware)(role_1.role.user, role_1.role.provider), BitProject_controller_1.bitController.confirmProject);
router.post("/bit-project-approved/:bitProjectId", (0, auth_1.authMiddleware)(role_1.role.user), BitProject_controller_1.bitController.bitProjectApproved);
// current-projects
router.get("/current-projects", (0, auth_1.authMiddleware)(role_1.role.provider), BitProject_controller_1.bitController.currentProjects);
router.get("/pendings-bits", (0, auth_1.authMiddleware)(role_1.role.provider), BitProject_controller_1.bitController.pendingsBits);
//  project ok 
router.post("/workOkByProvider/:bitProjectId", (0, auth_1.authMiddleware)(role_1.role.provider), BitProject_controller_1.bitController.ProjectOkByProvider);
router.post("/workOkByUser/:bitProjectId", (0, auth_1.authMiddleware)(role_1.role.user), BitProject_controller_1.bitController.ProjectOkByUser);
router.post("/workNotOKByUser/:bitProjectId", (0, auth_1.authMiddleware)(role_1.role.user), BitProject_controller_1.bitController.ProjectNotOk);
exports.bitProjectRoutes = router;
