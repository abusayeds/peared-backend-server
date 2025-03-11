"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportPolicyRoutes = void 0;
const express_1 = __importDefault(require("express"));
const Terms_controller_1 = require("./Terms.controller");
const auth_1 = require("../../../middlewares/auth");
const router = express_1.default.Router();
router.post("/reportPolicy", (0, auth_1.authMiddleware)("admin"), Terms_controller_1.createTerms);
router.get("/", Terms_controller_1.getAllTerms);
router.post("/reportPolicy-update", Terms_controller_1.updateTerms);
exports.ReportPolicyRoutes = router;
