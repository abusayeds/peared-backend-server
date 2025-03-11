"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withDrawRoutes = void 0;
const express_1 = __importDefault(require("express"));
const role_1 = require("../../../utils/role");
const auth_1 = require("../../../middlewares/auth");
const withdraw_controller_1 = require("./withdraw.controller");
const router = express_1.default.Router();
router.get('/all-withdraw-req', (0, auth_1.authMiddleware)(role_1.role.admin), withdraw_controller_1.withDrawController.allWithWraw);
router.post('/withdraw/:withDrawId', (0, auth_1.authMiddleware)(role_1.role.admin), withdraw_controller_1.withDrawController.payByAdmin);
exports.withDrawRoutes = router;
