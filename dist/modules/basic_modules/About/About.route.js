"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutRoutes = void 0;
const express_1 = __importDefault(require("express"));
const About_controller_1 = require("./About.controller");
const auth_1 = require("../../../middlewares/auth");
const role_1 = require("../../../utils/role");
const router = express_1.default.Router();
router.post("/create-about", (0, auth_1.authMiddleware)(role_1.role.admin), About_controller_1.createAbout);
router.get("/", (0, auth_1.authMiddleware)(role_1.role.admin, role_1.role.user, role_1.role.provider), About_controller_1.getAllAbout);
router.post("/update-about", (0, auth_1.authMiddleware)(role_1.role.admin), About_controller_1.updateAbout);
exports.AboutRoutes = router;
