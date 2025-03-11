import express from "express";

import { createAbout, getAllAbout, updateAbout } from "./About.controller";
import { authMiddleware } from "../../../middlewares/auth";
import { role } from "../../../utils/role";

const router = express.Router();
router.post("/create-about", authMiddleware(role.admin), createAbout);
router.get("/", authMiddleware(role.admin, role.user, role.provider), getAllAbout);
router.post("/update-about", authMiddleware(role.admin), updateAbout);

export const AboutRoutes = router;
