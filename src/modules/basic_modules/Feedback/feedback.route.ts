import express from "express";

import { getFeedback, giveFeedback } from "./feedback.controller";
import { authMiddleware } from "../../../middlewares/auth";

const router = express.Router();

router.post("/give", authMiddleware("user"), giveFeedback);
router.get("/", authMiddleware("admin"), getFeedback);

export const feedBackRoutes = router;
