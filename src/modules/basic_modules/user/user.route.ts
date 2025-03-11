import express from "express";
import {
  BlockUser,
  deleteUser,
  userController,
} from "./user.controller";
import { userValidation } from "./user.validation";
import zodValidation from "../../../middlewares/zodValidationHandler";

import { authMiddleware } from "../../../middlewares/auth";
import { role } from "../../../utils/role";
import handleFileUpload from "../../../middlewares/pdfFileUpload";

const router = express.Router();
router.post("/register", zodValidation(userValidation.registerUserValidation), userController.registerUser,);
router.post("/join-provider", handleFileUpload, zodValidation(userValidation.joinProviderValidation), userController.joinProvider,);
router.post("/login", zodValidation(userValidation.loginValidation), userController.loginUser);
router.post("/forget-password", userController.forgotPassword);
router.post("/verify-forget-otp", userController.verifyForgotPasswordOTP);
router.post("/resend", userController.resendOTP);
router.post("/reset-password", zodValidation(userValidation.resetPassWordValidation), userController.resetPassword);
router.post("/change-password", authMiddleware(role.user, role.provider, role.admin), userController.changePassword);
router.post("/update", handleFileUpload, userController.updateUser);
router.get("/my-profile", userController.myProfile);
router.get("/all-user", authMiddleware(role.admin), userController.getAllUsers);
router.post("/block-user", authMiddleware(role.admin), BlockUser);
router.post("/delete", authMiddleware(role.admin), deleteUser);

// req provider
router.get("/request-provider", authMiddleware(role.admin), userController.requestProvider);
router.get("/confirm-provider", authMiddleware(role.admin), userController.confirmProvider);
router.post("/approve-provider", authMiddleware(role.admin), userController.approveProvider);



export const UserRoutes = router;
