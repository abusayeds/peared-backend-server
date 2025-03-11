import express from "express";

import { authMiddleware } from "../../../middlewares/auth";
import { contactController } from "./contact-controller";
import { role } from "../../../utils/role";

const router = express.Router();
router.post("/create-contact", authMiddleware(role.user), contactController.createContact);
router.get("/all-message", authMiddleware(role.admin), contactController.getContactMessage);
router.get("/user-message/:userId", authMiddleware(role.admin), contactController.getContactUserMessage);

export const contactRoutes = router;