import express from "express";
import { authMiddleware } from "../../../middlewares/auth"; import zodValidation from "../../../middlewares/zodValidationHandler";
import { role } from "../../../utils/role";
import { adminController } from "./admin.controller";

const router = express.Router();

router.get("/dashboard", authMiddleware(role.admin), adminController.adminDashboard);

export const adminRoutes = router;