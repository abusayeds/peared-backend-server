import express from "express";
import { authMiddleware } from "../../../middlewares/auth"; import zodValidation from "../../../middlewares/zodValidationHandler";
import { role } from "../../../utils/role";
import { adminController } from "./admin.controller";
const router = express.Router();
router.get("/dashboard", authMiddleware(role.admin), adminController.adminDashboard);
router.get("/earnings", authMiddleware(role.admin), adminController.earnings);
router.get("/income/:year", authMiddleware(role.admin), adminController.adminIncome);
router.get("/transaction/:year", authMiddleware(role.admin), adminController.adminTransaction);

export const adminRoutes = router;