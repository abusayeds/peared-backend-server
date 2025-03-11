import express from "express";


import {
  createPrivacy,
  getAllPrivacy,
  updatePrivacy,
} from "./Privacy.controller";
import { authMiddleware } from "../../../middlewares/auth";

const router = express.Router();
router.post("/create-privacy", authMiddleware("admin"), createPrivacy);
router.get("/", getAllPrivacy);
router.post("/update-privacy", updatePrivacy);

export const PrivacyRoutes = router;
