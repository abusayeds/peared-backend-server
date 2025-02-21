import express from "express";

import { createAbout, getAllAbout, updateAbout } from "./About.controller";
import { authMiddleware } from "../../../middlewares/auth";

const router = express.Router();
router.post("/create", authMiddleware("admin"), createAbout);
router.get("/", getAllAbout);
router.post("/update", updateAbout);

export const AboutRoutes = router;
