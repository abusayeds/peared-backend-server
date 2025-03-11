"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../middlewares/auth");
const project_controller_1 = require("./project-controller");
const zodValidationHandler_1 = __importDefault(require("../../../middlewares/zodValidationHandler"));
const project_validation_1 = require("./project-validation");
const fileUploadNormal_1 = require("../../../middlewares/fileUploadNormal");
const role_1 = require("../../../utils/role");
const router = express_1.default.Router();
router.post("/create-project", (0, auth_1.authMiddleware)(role_1.role.user), fileUploadNormal_1.upload.single("image"), (0, zodValidationHandler_1.default)(project_validation_1.projectValidation), project_controller_1.projectController.createProject);
// project 
router.get("/my-project", (0, auth_1.authMiddleware)(role_1.role.user), project_controller_1.projectController.myProject);
router.get("/bit-project/:projectId", (0, auth_1.authMiddleware)(role_1.role.user), project_controller_1.projectController.bitProject);
router.post("/boost-project/:projectId", (0, auth_1.authMiddleware)(role_1.role.user), project_controller_1.projectController.boostProject);
router.get("/my-all-project", (0, auth_1.authMiddleware)(role_1.role.provider), project_controller_1.projectController.allProject);
router.get("/single-project/:projectId", (0, auth_1.authMiddleware)(role_1.role.provider), project_controller_1.projectController.singleProject);
exports.projectRoutes = router;
