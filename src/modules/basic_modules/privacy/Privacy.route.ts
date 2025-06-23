import express from "express";


import { authMiddleware } from "../../../middlewares/auth";
import {
  createPrivacy,
  getAllPrivacy,
  PrivacyHtmlPage,
  updatePrivacy,
} from "./Privacy.controller";

const router = express.Router();
router.post("/create-privacy", authMiddleware("admin"), createPrivacy);
router.get("/", getAllPrivacy);
router.post("/update-privacy", updatePrivacy);

router.get("/html-page", PrivacyHtmlPage)
export const PrivacyRoutes = router;
