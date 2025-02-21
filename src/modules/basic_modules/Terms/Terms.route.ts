import express from "express";


import { createTerms, getAllTerms, updateTerms } from "./Terms.controller";
import { authMiddleware } from "../../../middlewares/auth";

const router = express.Router();
router.post("/create", authMiddleware("admin"), createTerms);
router.get("/", getAllTerms);
router.post("/update", updateTerms);

export const TermsRoutes = router;
