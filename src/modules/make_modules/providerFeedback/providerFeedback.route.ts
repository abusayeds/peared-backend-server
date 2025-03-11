import express from "express";
import { authMiddleware } from "../../../middlewares/auth";
import zodValidation from "../../../middlewares/zodValidationHandler";
import { role } from "../../../utils/role";
import { providerFeedbackController } from "./providerFeedback.controller";


const router = express.Router();

router.post("/create-provider-feedBack", authMiddleware(role.user), providerFeedbackController.createProviderFeedback);
router.post("/is-favourite", authMiddleware(role.provider), providerFeedbackController.Isfavourite);

router.get("/my-review", authMiddleware(role.provider), providerFeedbackController.myReview)
router.get("/top-reviews/:providerId", authMiddleware(role.user), providerFeedbackController.topReviews)
router.get("/avarage-reviews", authMiddleware(role.provider), providerFeedbackController.avarageReviews)


export const providerFeedRotes = router;