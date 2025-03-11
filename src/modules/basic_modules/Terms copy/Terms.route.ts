import express from "express";


import { createTerms, getAllTerms, updateTerms } from "./Terms.controller";
import { authMiddleware } from "../../../middlewares/auth";

const router = express.Router();
router.post("/reportPolicy", authMiddleware("admin"), createTerms);
router.get("/", getAllTerms);
router.post("/reportPolicy-update", updateTerms);

export const ReportPolicyRoutes = router;
