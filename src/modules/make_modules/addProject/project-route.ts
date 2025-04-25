import express from "express";
import { authMiddleware } from "../../../middlewares/auth";
import { projectController } from "./project-controller";

import { upload } from "../../../middlewares/fileUploadNormal";
import zodValidation from "../../../middlewares/zodValidationHandler";
import { role } from "../../../utils/role";
import { projectValidation } from "./project-validation";

const router = express.Router();

router.post("/create-project", authMiddleware(role.user), upload.single("image"), zodValidation(projectValidation), projectController.createProject);


// project 
router.get("/my-project", authMiddleware(role.user), projectController.myProject);
router.get("/bit-project/:projectId", authMiddleware(role.user), projectController.bitProject);
router.post("/boost-project/:projectId", authMiddleware(role.user), projectController.boostProject);
// provider All project
router.get("/my-all-project", authMiddleware(role.provider), projectController.allProject);
router.get("/single-project/:projectId", authMiddleware(role.provider, role.user), projectController.singleProject);
router.post("/update-project/:projectId", authMiddleware(role.user), upload.single("image"), projectController.updateProject);

export const projectRoutes = router;
