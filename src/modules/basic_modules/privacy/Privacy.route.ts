import express from "express";


import {
  createPrivacy,
  getAllPrivacy,
  updatePrivacy,
} from "./Privacy.controller";
import { authMiddleware } from "../../../middlewares/auth";

const router = express.Router();
router.post("/create", authMiddleware("admin"), createPrivacy);
router.get("/", getAllPrivacy);
router.post("/update", updatePrivacy);

export const PrivacyRoutes = router;
