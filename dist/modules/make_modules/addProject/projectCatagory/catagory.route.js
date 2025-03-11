"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.catagoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../../middlewares/auth");
const role_1 = require("../../../../utils/role");
const catagory_controller_1 = require("./catagory.controller");
const router = express_1.default.Router();
router.post("/create-catagory", (0, auth_1.authMiddleware)(role_1.role.admin), catagory_controller_1.catagoryController.createCategory);
router.get("/all-catagory", catagory_controller_1.catagoryController.AllCatagory);
router.post("/update-catagory/:catagoryId", (0, auth_1.authMiddleware)(role_1.role.admin), catagory_controller_1.catagoryController.updateCatagory);
exports.catagoryRoutes = router;
