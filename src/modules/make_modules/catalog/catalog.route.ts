import express from "express";
import { authMiddleware } from "../../../middlewares/auth";
import { role } from "../../../utils/role";
import { catalogController } from "./catalog.controller";

const router = express.Router();

router.get("/services", catalogController.searchServices);
router.post(
  "/services/find-or-create",
  authMiddleware(role.user, role.provider, role.admin),
  catalogController.findOrCreateService
);

router.get("/educations", catalogController.searchEducations);
router.post(
  "/educations/find-or-create",
  authMiddleware(role.user, role.provider, role.admin),
  catalogController.findOrCreateEducation
);

export const catalogRoutes = router;
